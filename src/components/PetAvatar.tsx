import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PetAppearance, CharacterSpeciesId } from '../types/gameTypes';
import { VectorPetRenderer } from './pet/VectorPetRenderer';
import { getCharacterDefinition } from '../pet/petCharacters';

interface PetAvatarProps {
  appearance?: PetAppearance;
  species?: CharacterSpeciesId;
  size?: number;
}

export const PetAvatar: React.FC<PetAvatarProps> = ({
  appearance,
  species,
  size = 38,
}) => {
  const resolvedSpecies = species || appearance?.characterId || 'rabbit';
  const charDef = getCharacterDefinition(resolvedSpecies);

  // VectorPetRenderer is 240 width x 290 height.
  // Head is centered at ~cx=120, cy=118, radius ~54.
  // We want the head & upper chest to fill the circular avatar container.
  const scale = (size * 1.5) / 120;
  const rendererWidth = 240 * scale;
  const rendererHeight = 290 * scale;

  return (
    <View
      style={[
        styles.avatarCircle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: charDef.badgeBg,
          borderColor: charDef.accentColor,
        },
      ]}
    >
      <View
        style={{
          width: rendererWidth,
          height: rendererHeight,
          position: 'absolute',
          top: -38 * scale,
          left: (size - rendererWidth) / 2,
        }}
      >
        <VectorPetRenderer
          species={resolvedSpecies}
          appearance={appearance}
          width={rendererWidth}
          height={rendererHeight}
          animation="idle"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarCircle: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
});
