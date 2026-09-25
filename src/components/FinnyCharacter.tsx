import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import {
  PET_CUSTOM_ASSETS,
  PetAnimationType,
} from '../pet/petFrames';
import { IconSparkleStar, IconHeart } from './GameIcons';
import { PetAppearance } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';

interface FinnyCharacterProps {
  currentAnimation?: PetAnimationType;
  onTap?: () => void;
  scale?: number;
  appearance?: PetAppearance;
}

export const FinnyCharacter: React.FC<FinnyCharacterProps> = memo(({
  currentAnimation = 'idle',
  onTap,
  scale = 1,
  appearance,
}) => {
  const currentAppearance = appearance || gameStore.getState().profile.appearance;
  const [activeAnim, setActiveAnim] = useState<PetAnimationType>(currentAnimation);
  const [showReaction, setShowReaction] = useState(false);

  // UI Animations (Jump, Breath, Reaction, Shadow)
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const breathAnimY = useRef(new Animated.Value(1)).current;
  const breathAnimX = useRef(new Animated.Value(1)).current;

  // Continuous organic breathing anchored at feet
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(breathAnimY, {
            toValue: 1.018,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnimX, {
            toValue: 0.993,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(breathAnimY, {
            toValue: 1.0,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(breathAnimX, {
            toValue: 1.0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [breathAnimY, breathAnimX]);

  // Update activeAnim if external prop changes
  useEffect(() => {
    if (currentAnimation !== activeAnim) {
      setActiveAnim(currentAnimation);
    }
  }, [currentAnimation]);

  // Natural Blinking Timer (every 3.8 to 6.8 seconds when in idle)
  useEffect(() => {
    let blinkTimeout: any;
    let blinkEndTimeout: any;

    const scheduleNextBlink = () => {
      const delay = 3800 + Math.random() * 3000;
      blinkTimeout = setTimeout(() => {
        if (activeAnim === 'idle') {
          setActiveAnim('blink');
          blinkEndTimeout = setTimeout(() => {
            setActiveAnim((cur) => (cur === 'blink' ? 'idle' : cur));
            scheduleNextBlink();
          }, 180);
        } else {
          scheduleNextBlink();
        }
      }, delay);
    };

    scheduleNextBlink();

    return () => {
      if (blinkTimeout) clearTimeout(blinkTimeout);
      if (blinkEndTimeout) clearTimeout(blinkEndTimeout);
    };
  }, [activeAnim]);

  // Interactive Tap: triggers spring jump + celebrating photo pose + reaction badge
  const handleTap = useCallback(() => {
    if (onTap) onTap();

    // Trigger reaction bubble with smooth fade & float
    setShowReaction(true);
    reactionAnim.setValue(0);
    Animated.timing(reactionAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => setShowReaction(false));

    // Joyful spring jump & dynamic shadow
    Animated.sequence([
      Animated.parallel([
        Animated.timing(jumpAnim, {
          toValue: -22,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(shadowScale, {
          toValue: 0.78,
          duration: 160,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(jumpAnim, {
          toValue: 0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.spring(shadowScale, {
          toValue: 1.0,
          friction: 6,
          tension: 90,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Switch to celebrating photo pose for 1400ms
    setActiveAnim('celebrating');
    setTimeout(() => {
      setActiveAnim('idle');
    }, 1400);
  }, [onTap, jumpAnim, shadowScale, reactionAnim]);

  // Determine base 3D photorealistic render for character idle/customization
  const getBaseCustomPhoto = () => {
    const stage = gameStore.getState().profile.stage;
    if (stage === 3) {
      return PET_CUSTOM_ASSETS.stages[3];
    }
    if (currentAppearance.hat === 'beret') {
      return PET_CUSTOM_ASSETS.hats.beret;
    }
    if (currentAppearance.hat === 'glasses') {
      return PET_CUSTOM_ASSETS.hats.glasses;
    }
    if (currentAppearance.sweaterColor === 'blue') {
      return PET_CUSTOM_ASSETS.sweaters.blue;
    }
    if (currentAppearance.sweaterColor === 'red') {
      return PET_CUSTOM_ASSETS.sweaters.red;
    }
    return PET_CUSTOM_ASSETS.sweaters.green;
  };

  const basePhotoSource = getBaseCustomPhoto();

  return (
    <View
      style={[
        styles.outerContainer,
        scale !== 1 && { transform: [{ scale }] },
      ]}
      pointerEvents="box-none"
    >
      {/* Contact Shadow beneath paws on the rug */}
      <Animated.View
        style={[
          styles.shadow,
          {
            transform: [
              { scaleX: shadowScale },
              { scaleY: shadowScale },
            ],
          },
        ]}
      />

      {/* Floating Reaction Bubble */}
      {showReaction && (
        <Animated.View
          style={[
            styles.reactionBubble,
            {
              opacity: reactionAnim.interpolate({
                inputRange: [0, 0.15, 0.8, 1],
                outputRange: [0, 1, 1, 0],
              }),
              transform: [
                {
                  translateY: reactionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, -50],
                  }),
                },
                {
                  scale: reactionAnim.interpolate({
                    inputRange: [0, 0.2, 1],
                    outputRange: [0.7, 1.1, 0.95],
                  }),
                },
              ],
            },
          ]}
        >
          <IconSparkleStar size={14} color="#F59E0B" />
          <Text style={styles.reactionText}>Привет!</Text>
          <IconHeart size={13} color="#E11D48" />
        </Animated.View>
      )}

      {/* Interactive 3D Character with Breathing & Jump */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <Animated.View
          style={[
            styles.characterWrapper,
            {
              transform: [
                { translateY: jumpAnim },
                { scaleY: breathAnimY },
                { scaleX: breathAnimX },
              ],
              cursor: 'pointer',
            } as any,
          ]}
        >
          <View style={styles.characterImgContainer} pointerEvents="none">
            {/* 1. Base Idle Photorealistic 3D Character Render */}
            <Image
              source={basePhotoSource}
              style={[
                StyleSheet.absoluteFill,
                styles.characterImg,
                {
                  opacity: (activeAnim === 'idle') ? 1 : 0,
                },
              ]}
              resizeMode="contain"
            />

            {/* 2. Natural Blink Frame */}
            <Image
              source={PET_CUSTOM_ASSETS.actions.blink}
              style={[
                StyleSheet.absoluteFill,
                styles.characterImg,
                {
                  opacity: (activeAnim === 'blink') ? 1 : 0,
                },
              ]}
              resizeMode="contain"
            />

            {/* 3. Celebrating / Happy Cheering Photo Pose */}
            <Image
              source={PET_CUSTOM_ASSETS.actions.celebrating}
              style={[
                StyleSheet.absoluteFill,
                styles.characterImg,
                {
                  opacity: (activeAnim === 'celebrating' || activeAnim === 'happy') ? 1 : 0,
                },
              ]}
              resizeMode="contain"
            />

            {/* 4. Eating Crunchy Carrot Action Pose */}
            <Image
              source={PET_CUSTOM_ASSETS.actions.eating}
              style={[
                StyleSheet.absoluteFill,
                styles.characterImg,
                {
                  opacity: (activeAnim === 'eating') ? 1 : 0,
                },
              ]}
              resizeMode="contain"
            />

            {/* 5. Sleeping Peaceful Closed-Eyes Pose */}
            <Image
              source={PET_CUSTOM_ASSETS.actions.sleeping}
              style={[
                StyleSheet.absoluteFill,
                styles.characterImg,
                {
                  opacity: (activeAnim === 'sleeping') ? 1 : 0,
                },
              ]}
              resizeMode="contain"
            />

            {/* 6. Waving Hello Pose */}
            <Image
              source={PET_CUSTOM_ASSETS.actions.waving}
              style={[
                StyleSheet.absoluteFill,
                styles.characterImg,
                {
                  opacity: (activeAnim === 'waving') ? 1 : 0,
                },
              ]}
              resizeMode="contain"
            />
          </View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    bottom: -2,
    width: 155,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(38, 22, 14, 0.32)',
    transform: [{ scaleY: 0.5 }],
    zIndex: 1,
  },
  characterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  characterImgContainer: {
    width: 300,
    height: 380,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  characterImg: {
    width: '100%',
    height: '100%',
  },
  reactionBubble: {
    position: 'absolute',
    top: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  reactionText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
  },
});
