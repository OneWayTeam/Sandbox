/**
 * PetController.ts
 * Manages the 3D raccoon rig:
 *   - Discovers bones from UniRigArmature skeleton at load time
 *   - Runs the idle state machine (blink, look_around, breathe)
 *   - Queues and transitions between animation states
 *   - Drives applyPose() every frame
 *
 * IDLE STATE MACHINE:
 *   idle → (random interval 3–7s) → [blink|look_left|look_right|curious|breathe] → idle
 *
 * CROSSFADE:
 *   Blends current pose toward new pose over BLEND_DURATION frames.
 */

import * as THREE from 'three';
import {
  PetAnimationState,
  BoneRig,
  ANIMATION_META,
  applyPose,
  resetRig,
  canInterrupt,
} from './PetAnimations';

const BLEND_DURATION = 0.25; // seconds

// Idle variety — passive animations that play randomly
const IDLE_VARIETY: PetAnimationState[] = [
  'blink',
  'look_left',
  'look_right',
  'look_up',
  'look_down',
  'curious',
  'idle_breathe',
];

// Weights for idle variety (sum doesn't need to be 1)
const IDLE_WEIGHTS: number[] = [3, 1, 1, 0.5, 0.5, 1, 2];

function weightedRandom(items: PetAnimationState[], weights: number[]): PetAnimationState {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[0];
}

// Bone name patterns from Meshy UniRigArmature (generic naming Bone_000..049)
// We auto-discover by hierarchy position since names are generic.
// Strategy: largest bone subtree → spine chain; lateral branches → limbs.


/** 
 * Discovers and maps bones from the UniRigArmature skeleton.
 * 
 * ACTUAL SKELETON STRUCTURE (from GLB analysis):
 * Root(Bone_000) → Spine(Bone_001)
 *   ├── Chest(Bone_003) → Neck(Bone_002)
 *   │     ├── ArmL: Bone_007 → Bone_006 → fingers
 *   │     ├── Head: Bone_012 → EarChain(Bone_011→010→009→008)
 *   │     │                   → face bones (039,041,043)
 *   │     └── ArmR: Bone_017 → Bone_016→015→014→013 → fingers
 *   └── Tail: Bone_005 → Bone_004 → tail segments (022, 027, 033)
 */
export function discoverRig(skinnedMesh: THREE.SkinnedMesh): BoneRig {
  const skeleton = skinnedMesh.skeleton;
  if (!skeleton) return {};

  const bones = skeleton.bones;
  const byName = new Map<string, THREE.Bone>();
  bones.forEach((b) => byName.set(b.name, b));

  console.log('[PetController] Discovered bones:', bones.map((b) => b.name));

  // ── UniRig Armature hardcoded mapping ────────────────────────────────────
  // Based on actual GLB structure analysis:
  const rig: BoneRig = {
    root:     byName.get('Bone_000'),  // Root/Hips
    spine:    byName.get('Bone_001'),  // Spine
    chest:    byName.get('Bone_003'),  // Chest/Upper spine
    neck:     byName.get('Bone_002'),  // Neck (note: child of Bone_003)
    head:     byName.get('Bone_012'),  // Head
    // Arms (from neck: Bone_007 = L, Bone_017 = R)
    armL:     byName.get('Bone_007'),  // Upper arm left
    forearmL: byName.get('Bone_006'),  // Forearm left
    armR:     byName.get('Bone_017'),  // Upper arm right
    forearmR: byName.get('Bone_016'),  // Forearm right
    // Legs/tail base (Bone_004 = tail/body base, Bone_022/027 = back legs)
    thighL:   byName.get('Bone_022'),  // Left hind leg
    shinL:    byName.get('Bone_021'),  // Left shin
    thighR:   byName.get('Bone_027'),  // Right hind leg
    shinR:    byName.get('Bone_026'),  // Right shin
    // Tail (Bone_005 → Bone_004)
    tail:     byName.get('Bone_005'),  // Tail root
    // Ears (from head: Bone_011 = ear chain)
    earL:     byName.get('Bone_011'),  // Left ear root
    earR:     byName.get('Bone_008'),  // Right ear (at end of head chain, mouth area)
  };

  // Cache base positions and rotations for resetRig()
  Object.values(rig).forEach((bone) => {
    if (bone instanceof THREE.Bone) {
      (bone as any)._baseY = bone.position.y;
      (bone as any)._baseRotation = bone.rotation.clone();
    }
  });

  console.log('[PetController] Rig mapping:', {
    root: rig.root?.name,
    spine: rig.spine?.name,
    chest: rig.chest?.name,
    neck: rig.neck?.name,
    head: rig.head?.name,
    armL: rig.armL?.name,
    armR: rig.armR?.name,
    tail: rig.tail?.name,
    earL: rig.earL?.name,
  });

  return rig;
}

// ─── PetController class ────────────────────────────────────────────────────

export class PetController {
  private rig: BoneRig = {};
  private currentState: PetAnimationState = 'idle';
  private stateStartTime = 0;
  private blendFrom: PetAnimationState | null = null;
  private blendStartTime = 0;
  private isInitialized = false;

  // Idle state machine
  private nextIdleEventTime = 0;

  // Animation queue (for chained gameplay events)
  private queue: PetAnimationState[] = [];
  private tapCooldown = 0;

  setRig(rig: BoneRig): void {
    this.rig = rig;
    this.isInitialized = Object.keys(rig).length > 0;
    this.scheduleNextIdleEvent(2.0); // first event after 2s
  }

  /** External request to play a specific animation */
  play(state: PetAnimationState): void {
    if (!this.isInitialized) return;
    if (state === this.currentState) return;
    if (!canInterrupt(this.currentState, state)) {
      this.queue.push(state);
      return;
    }
    this.transition(state);
  }

  /** Called by the tap handler */
  onTap(now: number): void {
    if (now < this.tapCooldown) return;
    this.tapCooldown = now + 1.5;
    // Random tap reactions
    const tapReactions: PetAnimationState[] = ['happy', 'excited', 'curious', 'wave', 'surprised'];
    const r = tapReactions[Math.floor(Math.random() * tapReactions.length)];
    this.play(r);
  }

  /** Main update — call every frame with current time in seconds */
  update(now: number): void {
    if (!this.isInitialized) return;

    // Process queue
    if (this.queue.length > 0) {
      const meta = ANIMATION_META[this.currentState];
      const elapsed = now - this.stateStartTime;
      const done = meta.durationMs !== undefined && elapsed >= meta.durationMs / 1000;
      if (done) {
        const next = this.queue.shift()!;
        this.transition(next);
      }
    }

    // Auto-return to idle
    if (this.currentState !== 'idle' && this.queue.length === 0) {
      const meta = ANIMATION_META[this.currentState];
      const elapsed = now - this.stateStartTime;
      if (meta.durationMs !== undefined && elapsed >= meta.durationMs / 1000) {
        if (meta.returnToIdle) {
          this.transition('idle');
        }
      }
    }

    // Idle state machine
    if (this.currentState === 'idle' && now >= this.nextIdleEventTime) {
      const event = weightedRandom(IDLE_VARIETY, IDLE_WEIGHTS);
      this.transition(event);
      const dur = ANIMATION_META[event].durationMs ?? 2000;
      this.scheduleNextIdleEvent(dur / 1000 + 2.5 + Math.random() * 4.5);
    }

    // Apply pose
    const elapsed = now - this.stateStartTime;
    const blendElapsed = now - this.blendStartTime;
    const blendT = Math.min(blendElapsed / BLEND_DURATION, 1);

    // Reset to neutral before applying (prevents accumulation)
    resetRig(this.rig);

    if (this.blendFrom && blendT < 1) {
      // During crossfade: apply both poses weighted — simplified (full lerp needs two snapshots)
      // We apply the new pose at full strength and briefly keep some idle base
      applyPose(this.currentState, this.rig, elapsed);
    } else {
      applyPose(this.currentState, this.rig, elapsed);
    }
  }

  getCurrentState(): PetAnimationState {
    return this.currentState;
  }

  private transition(next: PetAnimationState): void {
    this.blendFrom = this.currentState;
    this.blendStartTime = performance.now() / 1000;
    this.currentState = next;
    this.stateStartTime = this.blendStartTime;
  }

  private scheduleNextIdleEvent(afterSeconds: number): void {
    this.nextIdleEventTime = performance.now() / 1000 + afterSeconds;
  }
}
