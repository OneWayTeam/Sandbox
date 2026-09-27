import React from 'react';
import { View, StyleSheet, Image, Animated, Platform } from 'react-native';
import { CharacterSpeciesId, PetAppearance, PetMoodState } from '../../types/gameTypes';
import { PetAnimationType } from '../../pet/petFrames';
import { getCharacterArt, PET_ACCESSORY_ASSETS } from '../../pet/petArtAssets';

interface RealArtPetRendererProps {
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

/**
 * Per-species accessory placement offsets.
 * All values are in the base canvas coordinate space (400×480).
 * The renderer scales them by (renderWidth / 400).
 *
 * beretTop / beretLeft / beretW / beretH   — Beret hat placement
 * glassTop / glassLeft / glassW / glassH   — Glasses placement
 * broochTop / broochLeft / broochW / broochH — Chest brooch placement
 */
interface SpeciesOffsets {
  beretTop: number;
  beretLeft: number;
  beretW: number;
  beretH: number;
  glassTop: number;
  glassLeft: number;
  glassW: number;
  glassH: number;
  broochTop: number;
  broochLeft: number;
  broochW: number;
  broochH: number;
}

const SPECIES_OFFSETS: Record<CharacterSpeciesId, SpeciesOffsets> = {
  rabbit: {
    beretTop: 4,  beretLeft: 126, beretW: 148, beretH: 120,
    glassTop: 104, glassLeft: 124, glassW: 152, glassH: 80,
    broochTop: 236, broochLeft: 174, broochW: 52, broochH: 52,
  },
  raccoon: {
    beretTop: 2,  beretLeft: 122, beretW: 156, beretH: 124,
    glassTop: 102, glassLeft: 118, glassW: 164, glassH: 82,
    broochTop: 230, broochLeft: 170, broochW: 56, broochH: 56,
  },
  fox: {
    beretTop: 0,  beretLeft: 124, beretW: 152, beretH: 120,
    glassTop: 100, glassLeft: 120, glassW: 160, glassH: 80,
    broochTop: 232, broochLeft: 172, broochW: 54, broochH: 54,
  },
  cat: {
    beretTop: 6,  beretLeft: 130, beretW: 140, beretH: 116,
    glassTop: 106, glassLeft: 126, glassW: 148, glassH: 78,
    broochTop: 238, broochLeft: 176, broochW: 50, broochH: 50,
  },
  panda: {
    beretTop: 4,  beretLeft: 118, beretW: 164, beretH: 128,
    glassTop: 106, glassLeft: 114, glassW: 172, glassH: 84,
    broochTop: 236, broochLeft: 172, broochW: 56, broochH: 56,
  },
  capybara: {
    beretTop: 10, beretLeft: 112, beretW: 176, beretH: 130,
    glassTop: 110, glassLeft: 108, glassW: 184, glassH: 86,
    broochTop: 240, broochLeft: 168, broochW: 60, broochH: 60,
  },
  bear: {
    beretTop: 0,  beretLeft: 116, beretW: 168, beretH: 128,
    glassTop: 100, glassLeft: 112, glassW: 176, glassH: 84,
    broochTop: 234, broochLeft: 168, broochW: 58, broochH: 58,
  },
  dog: {
    beretTop: 4,  beretLeft: 124, beretW: 152, beretH: 120,
    glassTop: 104, glassLeft: 120, glassW: 160, glassH: 80,
    broochTop: 234, broochLeft: 172, broochW: 54, broochH: 54,
  },
  otter: {
    beretTop: 6,  beretLeft: 128, beretW: 144, beretH: 118,
    glassTop: 104, glassLeft: 124, glassW: 152, glassH: 80,
    broochTop: 238, broochLeft: 174, broochW: 52, broochH: 52,
  },
};

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

  // Scale factor from base canvas (400x480) to render dimensions
  const scale = width / 400;

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

        {/* ACCESSORY LAYER: Hat (Beret) — species-calibrated position */}
        {hatType === 'beret' && hatSource && (
          <View
            style={[
              styles.accessoryBox,
              {
                top: offsets.beretTop * scale,
                left: offsets.beretLeft * scale,
                width: offsets.beretW * scale,
                height: offsets.beretH * scale,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={hatSource} style={styles.fillImage} resizeMode="contain" />
          </View>
        )}

        {/* ACCESSORY LAYER: Glasses — species-calibrated position */}
        {hatType === 'glasses' && hatSource && (
          <View
            style={[
              styles.accessoryBox,
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

        {/* ACCESSORY LAYER: Chest Brooch — species-calibrated position */}
        {broochSource && (
          <View
            style={[
              styles.accessoryBox,
              {
                top: offsets.broochTop * scale,
                left: offsets.broochLeft * scale,
                width: offsets.broochW * scale,
                height: offsets.broochH * scale,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={broochSource} style={styles.fillImage} resizeMode="contain" />
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
  accessoryBox: {
    position: 'absolute',
    zIndex: 3,
  },
});
