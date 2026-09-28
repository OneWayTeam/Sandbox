import React from 'react';
import { View, StyleSheet, Image, Animated, Platform } from 'react-native';
import { CharacterSpeciesId, PetAppearance, PetMoodState } from '../../types/gameTypes';
import { PetAnimationType } from '../../pet/petFrames';
import {
  getCharacterArt,
  PET_ACCESSORY_ASSETS,
  PET_COSMETIC_OFFSETS,
  PetCosmeticOffsets,
} from '../../pet/petArtAssets';

export type SpeciesOffsets = PetCosmeticOffsets;
export const SPECIES_OFFSETS = PET_COSMETIC_OFFSETS;

export interface RealArtPetRendererProps {
  species?: CharacterSpeciesId;
  appearance?: PetAppearance;
  animation?: PetAnimationType;
  moodState?: PetMoodState;
  width?: number;
  height?: number;
  jumpAnim?: Animated.Value;
  shadowScale?: Animated.Value;
  breathAnimY?: Animated.Value;
  breathAnimX?: Animated.Value;
}

const DEFAULT_OFFSETS = SPECIES_OFFSETS.rabbit;

export const RealArtPetRenderer: React.FC<RealArtPetRendererProps> = ({
  species = 'rabbit',
  appearance,
  animation = 'idle',
  moodState = 'calm',
  width = 240,
  height = 288,
  jumpAnim,
  shadowScale,
  breathAnimY,
  breathAnimX,
}) => {
  const resolvedSpecies = (species || appearance?.characterId || 'rabbit') as CharacterSpeciesId;
  const charArt = getCharacterArt(resolvedSpecies);
  const hatType = appearance?.hat || 'none';
  const accessoryType = appearance?.accessory || 'clover';
  const offsets = SPECIES_OFFSETS[resolvedSpecies] || DEFAULT_OFFSETS;

  const hatSource =
    hatType === 'beret'
      ? PET_ACCESSORY_ASSETS.hats.beret
      : hatType === 'glasses'
        ? PET_ACCESSORY_ASSETS.hats.glasses
        : null;

  const broochSource =
    accessoryType === 'clover'
      ? PET_ACCESSORY_ASSETS.brooches.clover
      : accessoryType === 'star'
        ? PET_ACCESSORY_ASSETS.brooches.star
        : accessoryType === 'brush'
          ? PET_ACCESSORY_ASSETS.brooches.brush
          : null;

  const scale = width / 400;

  const sweaterColor = appearance?.sweaterColor;
  const sweaterSource =
    sweaterColor && (PET_ACCESSORY_ASSETS.sweaters as any)[sweaterColor]
      ? (PET_ACCESSORY_ASSETS.sweaters as any)[sweaterColor]
      : null;

  const sweaterTop = (offsets.sweaterTop ?? (offsets.broochTop - 45)) * scale;
  const sweaterLeft = (offsets.sweaterLeft ?? (offsets.broochLeft - 68)) * scale;
  const sweaterW = (offsets.sweaterW ?? 204) * scale;
  const sweaterH = (offsets.sweaterH ?? 162) * scale;

  // Visual size normalization for brooches: star and brush have extra transparent padding
  // compared to clover which fills the asset box.
  let broochMultiplier = 1.0;
  let broochShift = 0;
  if (accessoryType === 'star') {
    broochMultiplier = 1.22;
    broochShift = -offsets.broochW * 0.11;
  } else if (accessoryType === 'brush') {
    broochMultiplier = 1.25;
    broochShift = -offsets.broochW * 0.125;
  }

  // Shadow style: fixed on ground level beneath feet (Y=465)
  const shadowWidth = 180 * scale;
  const shadowHeight = 44 * scale;
  const shadowBottom = (480 - 465 - 14) * scale;

  return (
    <View style={[styles.canvas, { width, height }]} pointerEvents="box-none">
      {/* 1. GROUND SHADOW LAYER: Sits strictly on floor level */}
      <Animated.View
        style={[
          styles.shadowContainer,
          {
            width: shadowWidth,
            height: shadowHeight,
            bottom: shadowBottom,
            left: (width - shadowWidth) / 2,
            transform: shadowScale ? [{ scaleX: shadowScale }, { scaleY: shadowScale }] : [],
          },
        ]}
        pointerEvents="none"
      >
        <Image
          source={PET_ACCESSORY_ASSETS.shadow}
          style={styles.fillImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* 2. CHARACTER ACTOR CONTAINER: Jumps & Breathes together with accessories */}
      <Animated.View
        style={[
          styles.actorContainer,
          {
            width,
            height,
            transform: [
              ...(jumpAnim ? [{ translateY: jumpAnim }] : []),
              ...(breathAnimY ? [{ scaleY: breathAnimY }] : []),
              ...(breathAnimX ? [{ scaleX: breathAnimX }] : []),
            ],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* REAL ART FULL-BODY CHARACTER */}
        <Image
          source={charArt.bodySource}
          style={styles.fillImage}
          resizeMode="contain"
        />

        {/* ACCESSORY LAYER: Chest Brooch — species-calibrated position & visual size normalization */}
        {broochSource && (
          <View
            style={[
              styles.broochBox,
              {
                top: (offsets.broochTop + broochShift) * scale,
                left: (offsets.broochLeft + broochShift) * scale,
                width: offsets.broochW * broochMultiplier * scale,
                height: offsets.broochH * broochMultiplier * scale,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={broochSource} style={styles.fillImage} resizeMode="contain" />
          </View>
        )}

        {/* ACCESSORY LAYER: Glasses — species-calibrated pupil alignment */}
        {hatType === 'glasses' && hatSource && (
          <View
            style={[
              styles.glassesBox,
              {
                top: offsets.glassTop * scale,
                left: offsets.glassLeft * scale,
                width: offsets.glassW * scale,
                height: offsets.glassH * scale,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={hatSource} style={styles.fillImage} resizeMode="contain" />
          </View>
        )}

        {/* ACCESSORY LAYER: Hat (Beret) — species-calibrated position & natural head angle */}
        {hatType === 'beret' && hatSource && (
          <View
            style={[
              styles.hatBox,
              {
                top: offsets.beretTop * scale,
                left: offsets.beretLeft * scale,
                width: offsets.beretW * scale,
                height: offsets.beretH * scale,
                transform: offsets.beretRotate ? [{ rotate: `${offsets.beretRotate}deg` }] : undefined,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={hatSource} style={styles.fillImage} resizeMode="contain" />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  canvas: {
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'visible',
  },
  shadowContainer: {
    position: 'absolute',
    zIndex: 1,
  },
  actorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 2,
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
  sweaterBox: {
    position: 'absolute',
    zIndex: 3,
  },
  broochBox: {
    position: 'absolute',
    zIndex: 4,
  },
  glassesBox: {
    position: 'absolute',
    zIndex: 5,
  },
  hatBox: {
    position: 'absolute',
    zIndex: 6,
  },
});
