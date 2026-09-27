/**
 * Pet3D.tsx
 * The main 3D pet renderer component.
 *
 * Uses:
 *   - expo-gl: native OpenGL ES context via GLView
 *   - three.js (r169): scene, camera, renderer, lights
 *   - expo-three: three.js renderer binding for expo-gl
 *   - GLTFLoader (three/addons): loads raccoon.glb
 *   - PetController: drives rig animations every frame
 *
 * Architecture:
 *   <Pet3D character="raccoon" animation="idle" interactive />
 *
 * Performance:
 *   - Model loaded ONCE, cached in module scope
 *   - requestAnimationFrame loop inside GL context
 *   - Transparent background (alpha: true)
 *   - Shadow map: BasicShadowMap (cheapest for mobile)
 */

import React, { useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Animated,
} from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from 'expo-gl';
import { Asset } from 'expo-asset';
import * as THREE from 'three';
import { Renderer } from 'expo-three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { PetCharacter, PET_ASSETS } from './petAssets';
import { PetAnimationState } from './PetAnimations';
import { PetController, discoverRig } from './PetController';

// ─── Module-level model cache ─────────────────────────────────────────────────
const modelCache = new Map<PetCharacter, THREE.Group>();

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pet3DProps {
  character?: PetCharacter;
  animation?: PetAnimationState;
  interactive?: boolean;
  scale?: number;
  onReady?: () => void;
  style?: any;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Pet3D: React.FC<Pet3DProps> = memo(({
  character = 'raccoon',
  animation,
  interactive = true,
  scale = 1,
  onReady,
  style,
}) => {
  const controllerRef = useRef<PetController>(new PetController());
  const rafRef = useRef<number>(0);
  const glRef = useRef<ExpoWebGLRenderingContext | null>(null);
  const rendererRef = useRef<any>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const loadedRef = useRef(false);

  // Floating reaction bubble (tap feedback)
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const [reactionMsg, setReactionMsg] = React.useState<string | null>(null);

  // External animation override
  useEffect(() => {
    if (animation) {
      controllerRef.current.play(animation);
    }
  }, [animation]);

  // ─── GL Context Setup ──────────────────────────────────────────────────────
  const onContextCreate = useCallback(async (gl: ExpoWebGLRenderingContext) => {
    glRef.current = gl;

    const { drawingBufferWidth: w, drawingBufferHeight: h } = gl;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new Renderer({ gl, alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(1); // Keep 1:1 for mobile performance
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap; // Cheapest for mobile
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;

    // ── Scene ─────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // ── Camera ────────────────────────────────────────────────────────────
    // Portrait phone: aspect = w/h, typically ~0.5
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.01, 50);
    // Position camera to show full character standing on ground
    camera.position.set(0, 1.1, 3.2);
    camera.lookAt(0, 0.9, 0); // look at chest height
    cameraRef.current = camera;

    // ── Lighting ──────────────────────────────────────────────────────────
    // Ambient: soft fill light
    const ambient = new THREE.AmbientLight(0xfff8f0, 0.9);
    scene.add(ambient);

    // Key light: warm from top-left (simulates room window)
    const keyLight = new THREE.DirectionalLight(0xfff5e0, 1.4);
    keyLight.position.set(-1.5, 3, 2);
    keyLight.castShadow = true;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 12;
    keyLight.shadow.camera.left = -2;
    keyLight.shadow.camera.right = 2;
    keyLight.shadow.camera.top = 2;
    keyLight.shadow.camera.bottom = -2;
    keyLight.shadow.mapSize.set(512, 512); // Mobile-friendly
    scene.add(keyLight);

    // Fill light: cool from right
    const fillLight = new THREE.DirectionalLight(0xe0eeff, 0.5);
    fillLight.position.set(2, 1.5, 1);
    scene.add(fillLight);

    // Rim light: back highlight to separate from background
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 2, -2);
    scene.add(rimLight);

    // ── Load Model ────────────────────────────────────────────────────────
    await loadModel(character, scene, controllerRef.current);
    loadedRef.current = true;
    onReady?.();

    // ── Render Loop ───────────────────────────────────────────────────────
    let lastTime = 0;
    const animate = (time: number) => {
      rafRef.current = requestAnimationFrame(animate);

      const now = time / 1000;
      if (now - lastTime < 0.016) return; // Cap at ~60fps
      lastTime = now;

      // Update pet controller (drives bone poses)
      controllerRef.current.update(now);

      renderer.render(scene, camera);
      gl.endFrameEXP(); // Required by expo-gl to flush the frame
    };

    rafRef.current = requestAnimationFrame(animate);
  }, [character]);

  // ─── Cleanup ──────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ─── Tap Interaction ──────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (!interactive) return;
    const now = performance.now() / 1000;
    controllerRef.current.onTap(now);

    // Show reaction bubble
    const msgs = ['Привет! 🐾', 'Поиграй со мной!', 'Ты лучший!', 'Финни рад!'];
    setReactionMsg(msgs[Math.floor(Math.random() * msgs.length)]);
    reactionAnim.setValue(0);
    Animated.timing(reactionAnim, {
      toValue: 1,
      duration: 1600,
      useNativeDriver: true,
    }).start(() => setReactionMsg(null));
  }, [interactive, reactionAnim]);

  return (
    <View style={[styles.container, style]}>
      {/* 3D GL Canvas */}
      <TouchableWithoutFeedback onPress={handleTap} disabled={!interactive}>
        <View style={styles.glWrapper}>
          <GLView
            style={styles.gl}
            onContextCreate={onContextCreate}
            msaaSamples={0} // Disable MSAA for performance (we do antialias in renderer)
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Reaction bubble (floating above pet) */}
      {reactionMsg && (
        <Animated.View
          style={[
            styles.reactionBubble,
            {
              opacity: reactionAnim.interpolate({
                inputRange: [0, 0.1, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: reactionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -50],
                  }),
                },
              ],
            },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.reactionText}>{reactionMsg}</Text>
        </Animated.View>
      )}
    </View>
  );
});

// ─── Model Loader ─────────────────────────────────────────────────────────────

async function loadModel(
  character: PetCharacter,
  scene: THREE.Scene,
  controller: PetController,
): Promise<void> {
  if (!GLTFLoader) {
    console.error('[Pet3D] GLTFLoader unavailable');
    return;
  }

  // Check cache
  if (modelCache.has(character)) {
    const cached = modelCache.get(character)!.clone();
    scene.add(cached);
    return;
  }

  const assetEntry = PET_ASSETS[character];
  if (!assetEntry) {
    console.warn('[Pet3D] No asset for character:', character);
    return;
  }

  try {
    // Resolve the asset URI via expo-asset (handles bundling + caching)
    const asset = await Asset.fromModule(assetEntry.model).downloadAsync();
    const uri = asset.localUri ?? asset.uri;

    if (!uri) {
      console.error('[Pet3D] Could not resolve URI for', character);
      return;
    }

    // Load GLB via GLTFLoader with fetch
    const gltf = await new Promise<any>((resolve, reject) => {
      const loader = new GLTFLoader();

      // expo-three provides a FileLoader override that works on RN
      loader.load(
        uri,
        resolve,
        (progress: any) => {
          if (progress.total > 0) {
            console.log('[Pet3D] Loading:', Math.round(progress.loaded / progress.total * 100) + '%');
          }
        },
        reject,
      );
    });

    const model = gltf.scene as THREE.Group;
    console.log('[Pet3D] Model loaded. Scene children:', model.children.length);

    // ── Scale & Position ──────────────────────────────────────────────────
    // Compute bounding box to auto-fit the character
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const modelHeight = size.y;

    // Target: character should be ~1.8 units tall in world space
    const targetHeight = 1.8;
    const autoScale = (targetHeight / modelHeight) * assetEntry.baseScale;
    model.scale.setScalar(autoScale);

    // Re-compute box after scale
    box.setFromObject(model);
    const minY = box.min.y;

    // Place feet exactly at y=0
    model.position.y = -minY + (assetEntry.groundOffset * autoScale);
    model.position.x = 0;
    model.position.z = 0;

    // Enable shadow casting
    model.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = false;
      }
    });

    scene.add(model);
    modelCache.set(character, model);

    // ── Rig Discovery ─────────────────────────────────────────────────────
    let rigFound = false;
    model.traverse((obj) => {
      if (!rigFound && obj instanceof THREE.SkinnedMesh) {
        console.log('[Pet3D] SkinnedMesh found:', obj.name);
        const rig = discoverRig(obj);
        controller.setRig(rig);
        rigFound = true;
      }
    });

    if (!rigFound) {
      console.warn('[Pet3D] No SkinnedMesh found in model');
    }

    // ── Animation Clips log ───────────────────────────────────────────────
    if (gltf.animations && gltf.animations.length > 0) {
      console.log('[Pet3D] GLB animation clips found:');
      gltf.animations.forEach((clip: THREE.AnimationClip) => {
        console.log('  -', clip.name, `(${clip.duration.toFixed(2)}s)`);
      });
    } else {
      console.log('[Pet3D] No animation clips in GLB — using procedural animation system');
    }

  } catch (err) {
    console.error('[Pet3D] Failed to load model:', err);
  }
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: 260,
    height: 320,
    alignItems: 'center',
    justifyContent: 'flex-end',
    position: 'relative',
  },
  glWrapper: {
    width: '100%',
    height: '100%',
  },
  gl: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  reactionBubble: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  reactionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});
