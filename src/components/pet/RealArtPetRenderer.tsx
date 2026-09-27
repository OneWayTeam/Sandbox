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
  const charArt = getCharacterArt(species || appearance?.characterId);
  const hatType = appearance?.hat || 'none';
  const accessoryType = appearance?.accessory || 'clover';

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

        {/* ACCESSORY LAYER: Hat (Beret / Glasses) */}
        {hatType === 'beret' && hatSource && (
          <View
            style={[
              styles.accessoryBox,
              {
                top: 4 * scale,
                left: 126 * scale,
                width: 148 * scale,
                height: 120 * scale,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={hatSource} style={styles.fillImage} resizeMode="contain" />
          </View>
        )}

        {hatType === 'glasses' && hatSource && (
          <View
            style={[
              styles.accessoryBox,
              {
                top: 104 * scale,
                left: 124 * scale,
                width: 152 * scale,
                height: 80 * scale,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={hatSource} style={styles.fillImage} resizeMode="contain" />
          </View>
        )}

        {/* ACCESSORY LAYER: Chest Brooch (Clover / Star / Brush) */}
        {broochSource && (
          <View
            style={[
              styles.accessoryBox,
              {
                top: 236 * scale,
                left: 174 * scale,
                width: 52 * scale,
                height: 52 * scale,
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
