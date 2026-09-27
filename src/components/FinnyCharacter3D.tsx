/**
 * FinnyCharacter3D.tsx
 * Drop-in replacement for the old FinnyCharacter.tsx (sprite-based rabbit).
 *
 * Keeps identical external API so no changes needed in RoomScreen or App.tsx.
 * Internally renders the real 3D raccoon via Pet3D + expo-gl + three.js.
 *
 * What's preserved from old FinnyCharacter:
 *   - Reaction bubble (income, savings, task, tap, stage_evolution)
 *   - Mood & stage status pill
 *   - onTap callback
 *   - scale prop
 *   - accessibility label
 *   - Game store reaction listener
 *
 * What's replaced:
 *   - PNG sprite layers → real 3D GLB character
 *   - Fake breathing scale animation → procedural bone breathing
 *   - PNG blink frame → procedural head bone pose
 *   - Jump Animated.Value → procedural jump bone pose
 */

import React, { useRef, useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  Animated,
  TouchableWithoutFeedback,
} from 'react-native';
import { Pet3D } from './pet/Pet3D';
import { PetAnimationState } from './pet/PetAnimations';
import { mapReactionToAnimation } from './pet/PetState';
import { IconSparkleStar, IconHeart, IconCheck } from './GameIcons';
import { PetAppearance, PetStage, PetMoodState, PetReactionEvent } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';
import { PetAssetRegistry } from '../pet/petAssetRegistry';

interface FinnyCharacter3DProps {
  currentAnimation?: PetAnimationState;
  onTap?: () => void;
  scale?: number;
  appearance?: PetAppearance;
  stage?: PetStage;
  moodState?: PetMoodState;
}

export const FinnyCharacter3D: React.FC<FinnyCharacter3DProps> = memo(({
  currentAnimation,
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

  // Which animation to play in 3D
  const [pet3DAnimation, setPet3DAnimation] = useState<PetAnimationState | undefined>(currentAnimation);

  // Reaction bubble state (same as before)
  const [activeReaction, setActiveReaction] = useState<PetReactionEvent | null>(null);
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const prevReactionTimestampRef = useRef<number>(0);

  // ── Sync external animation prop ────────────────────────────────────────
  useEffect(() => {
    if (currentAnimation) {
      setPet3DAnimation(currentAnimation);
    }
  }, [currentAnimation]);

  // ── Listen to game store reactions ──────────────────────────────────────
  const lastReactionFromStore = storeState.petState?.lastReaction;

  useEffect(() => {
    if (
      lastReactionFromStore &&
      lastReactionFromStore.timestamp > prevReactionTimestampRef.current
    ) {
      prevReactionTimestampRef.current = lastReactionFromStore.timestamp;
      setActiveReaction(lastReactionFromStore);

      // Map to 3D animation
      const anim = mapReactionToAnimation(lastReactionFromStore);
      setPet3DAnimation(anim);

      // Show reaction bubble
      if (animationsEnabled) {
        reactionAnim.setValue(0);
        Animated.timing(reactionAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }).start(() => setActiveReaction(null));
      } else {
        const timer = setTimeout(() => setActiveReaction(null), 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [lastReactionFromStore, animationsEnabled, reactionAnim]);

  // ── Tap handler ──────────────────────────────────────────────────────────
  const handleTap = useCallback(() => {
    if (onTap) onTap();
    // Pet3D's own controller handles tap internally via interactive prop
  }, [onTap]);

  // ── Stage & mood labels (same as before) ────────────────────────────────
  const layers = PetAssetRegistry.resolveLayers(
    currentAppearance,
    currentStage,
    currentMoodState,
    'idle',
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
      accessibilityLabel={`Финни-Енот. Стадия: ${layers.stageTitle}. Настроение: ${layers.moodLabel}.`}
    >
      {/* Floating Reaction Bubble */}
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
          pointerEvents="none"
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

      {/* ── THE 3D RACCOON ── */}
      <TouchableWithoutFeedback onPress={handleTap}>
        <View style={styles.pet3DWrapper}>
          <Pet3D
            character="raccoon"
            animation={pet3DAnimation}
            interactive={true}
            style={styles.pet3D}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Status Pill (mood + stage) */}
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
    width: 260,
    height: 330,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pet3DWrapper: {
    width: 260,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pet3D: {
    width: 260,
    height: 300,
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
  moodDotGreen: { backgroundColor: '#16A34A' },
  moodDotOrange: { backgroundColor: '#F59E0B' },
  moodDotBlue: { backgroundColor: '#2563EB' },
  statusPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
});
