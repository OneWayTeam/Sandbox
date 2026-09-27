import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { PetAppearance, CharacterSpeciesId } from '../types/gameTypes';
import { getCharacterArt } from '../pet/petArtAssets';
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
  const charArt = getCharacterArt(resolvedSpecies);
  const charDef = getCharacterDefinition(resolvedSpecies);

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
      <Image
        source={charArt.thumbSource}
        style={{
          width: size * 1.15,
          height: size * 1.15,
        }}
        resizeMode="contain"
      />
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
