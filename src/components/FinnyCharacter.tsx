import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Text,
} from 'react-native';
import { PetAnimationType } from '../pet/petFrames';
import { PetAssetRegistry } from '../pet/petAssetRegistry';
import { IconSparkleStar, IconHeart, IconClover, IconCheck } from './GameIcons';
import { PetAppearance, PetStage, PetMoodState, PetReactionEvent } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';
import { RealArtPetRenderer } from './pet/RealArtPetRenderer';

interface FinnyCharacterProps {
  currentAnimation?: PetAnimationType;
  onTap?: () => void;
  scale?: number;
  appearance?: PetAppearance;
  stage?: PetStage;
  moodState?: PetMoodState;
}

export const FinnyCharacter: React.FC<FinnyCharacterProps> = memo(({
  currentAnimation = 'idle',
  onTap,
  scale = 1,
  appearance,
  stage,
  moodState,
}) => {
  const storeState = gameStore.getState();
  const currentAppearance = appearance || (storeState as any).petCustomization || storeState.profile?.appearance || { sweaterColor: 'green', hat: 'none', accessory: 'clover' };
  const currentStage: PetStage = stage || ((storeState as any).petDevelopmentStage as PetStage) || storeState.profile?.stage || 1;
  const currentMoodState: PetMoodState = moodState || storeState.petState?.moodState || 'calm';
  const animationsEnabled = (storeState as any).settings?.animationsEnabled ?? true;

  const [activeAnim, setActiveAnim] = useState<PetAnimationType>(currentAnimation);
  const [activeReaction, setActiveReaction] = useState<PetReactionEvent | null>(null);

  // UI Animations (Jump, Breath, Reaction, Shadow)
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const breathAnimY = useRef(new Animated.Value(1)).current;
  const breathAnimX = useRef(new Animated.Value(1)).current;

  // 1. Organic Breathing loop (Only when animationsEnabled is true)
  useEffect(() => {
    if (!animationsEnabled) {
      breathAnimY.setValue(1.0);
      breathAnimX.setValue(1.0);
      return;
    }

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
  }, [animationsEnabled, breathAnimY, breathAnimX]);

  // 2. Sync prop animation
  useEffect(() => {
    if (currentAnimation !== activeAnim) {
      setActiveAnim(currentAnimation);
    }
  }, [currentAnimation]);

  // 3. Listen to store lastReaction changes (income, purchase, savings, task_completed, stage_evolution)
  const lastReactionFromStore = storeState.petState?.lastReaction;
  const prevReactionTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (
      lastReactionFromStore &&
      lastReactionFromStore.timestamp > prevReactionTimestampRef.current
    ) {
      prevReactionTimestampRef.current = lastReactionFromStore.timestamp;
      setActiveReaction(lastReactionFromStore);

      if (animationsEnabled) {
        reactionAnim.setValue(0);
        Animated.timing(reactionAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }).start(() => setActiveReaction(null));
      } else {
        // If animations disabled, display static badge briefly
        const timer = setTimeout(() => setActiveReaction(null), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [lastReactionFromStore, animationsEnabled, reactionAnim]);

  // 4. Natural Blinking Timer (no jarring strobe/flicker)
  useEffect(() => {
    if (!animationsEnabled) return;

    let blinkTimeout: any;
    let blinkEndTimeout: any;

    const scheduleNextBlink = () => {
      const delay = 3800 + Math.random() * 3200;
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
  }, [activeAnim, animationsEnabled]);

  // 5. Interactive Tap
  const handleTap = useCallback(() => {
    if (onTap) onTap();

    if (!animationsEnabled) {
      setActiveReaction({
        type: 'tap',
        message: 'Привет! Финни рад тебе!',
        timestamp: Date.now(),
      });
      return;
    }

    // Trigger reaction bubble with smooth fade & float
    setActiveReaction({
      type: 'tap',
      message: 'Привет!',
      timestamp: Date.now(),
    });
    reactionAnim.setValue(0);
    Animated.timing(reactionAnim, {
      toValue: 1,
      duration: 1400,
      useNativeDriver: true,
    }).start(() => setActiveReaction(null));

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
  }, [onTap, animationsEnabled, jumpAnim, shadowScale, reactionAnim]);

  // Resolve photorealistic visual layers using PetAssetRegistry
  const layers = PetAssetRegistry.resolveLayers(
    currentAppearance,
    currentStage,
    currentMoodState,
    activeAnim
  );

  return (
    <View
      style={[
        styles.outerContainer,
        scale !== 1 && { transform: [{ scale }] },
      ]}
      pointerEvents="box-none"
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={layers.accessibilityDescription}
    >
      {/* Floating Reaction Bubble for Income, Purchase, Savings, Tasks, Stage Growth, Tap */}
      {activeReaction && (
        <Animated.View
          style={[
            styles.reactionBubble,
            animationsEnabled
              ? {
                  opacity: reactionAnim.interpolate({
                    inputRange: [0, 0.15, 0.8, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                  transform: [
                    {
                      translateY: reactionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [10, -55],
                      }),
                    },
                    {
                      scale: reactionAnim.interpolate({
                        inputRange: [0, 0.2, 1],
                        outputRange: [0.7, 1.1, 0.95],
                      }),
                    },
                  ],
                }
              : { opacity: 1, top: -45 },
          ]}
        >
          {activeReaction.type === 'income' ? (
            <Image source={require('../../assets/coin.png')} style={styles.reactionCoinIcon} />
          ) : activeReaction.type === 'stage_evolution' ? (
            <IconSparkleStar size={16} color="#D97706" />
          ) : activeReaction.type === 'savings' ? (
            <Image source={require('../../assets/gold_bars.png')} style={styles.reactionCoinIcon} />
          ) : activeReaction.type === 'task_completed' ? (
            <IconCheck size={16} color="#16A34A" />
          ) : (
            <IconHeart size={14} color="#E11D48" />
          )}

          <Text style={styles.reactionText}>{activeReaction.message}</Text>
        </Animated.View>
      )}

      {/* Interactive Real Art Character with Natural Animation & Ground Contact */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.characterTouchZone}>
          <RealArtPetRenderer
            species={currentAppearance.characterId || 'rabbit'}
            appearance={currentAppearance}
            animation={activeAnim}
            moodState={currentMoodState}
            width={240}
            height={288}
            jumpAnim={jumpAnim}
            shadowScale={shadowScale}
            breathAnimY={animationsEnabled ? breathAnimY : undefined}
            breathAnimX={animationsEnabled ? breathAnimX : undefined}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Accessible Mood & Stage Status Pill (Never communicates critically through animation alone) */}
      <View style={styles.statusPill}>
        <View
          style={[
            styles.moodDot,
            currentMoodState === 'happy' || currentMoodState === 'excited'
              ? styles.moodDotGreen
              : currentMoodState === 'worried'
              ? styles.moodDotOrange
              : styles.moodDotBlue,
          ]}
        />
        <Text style={styles.statusPillText}>
          {layers.stageTitle} • {layers.moodLabel}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  outerContainer: {
    width: 250,
    height: 310,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  shadow: {
    position: 'absolute',
    bottom: 24,
    width: 140,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(30, 20, 10, 0.22)',
    alignSelf: 'center',
    zIndex: 1,
  },
  characterWrapper: {
    width: 240,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  characterImgContainer: {
    width: 240,
    height: 250,
    position: 'relative',
  },
  characterImg: {
    width: '100%',
    height: '100%',
  },
  reactionBubble: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    maxWidth: 220,
  },
  reactionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  reactionCoinIcon: {
    width: 16,
    height: 16,
  },
  characterTouchZone: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessoryBroochBox: {
    position: 'absolute',
    top: '56%',
    left: '37%',
    zIndex: 10,
  },
  broochCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  statusPill: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
    zIndex: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moodDotGreen: {
    backgroundColor: '#16A34A',
  },
  moodDotOrange: {
    backgroundColor: '#F59E0B',
  },
  moodDotBlue: {
    backgroundColor: '#2563EB',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
});
