import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { COLORS } from '../theme/colors';
import { IconGear } from './GameIcons';

interface TopHeaderProps {
  coins?: number;
  period?: number;
  playerName?: string;
  stageTitle?: string;
  avatarSource?: any;
  onPressProfile?: () => void;
  onPressSettings?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  coins = 5,
  period = 5,
  playerName = 'Зайка',
  stageTitle = 'Художник',
  avatarSource,
  onPressProfile,
  onPressSettings,
}) => {
  return (
    <View style={styles.container}>
      {/* Left Column: Profile & Period */}
      <View style={styles.leftCol}>
        {/* Profile Pill */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPressProfile}
          style={styles.profilePill}
        >
          <View style={styles.avatarBorder}>
            <Image
              source={avatarSource || require('../../assets/avatar.png')}
              style={styles.avatarImg}
              resizeMode="cover"
            />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName} numberOfLines={1}>{playerName}</Text>
            <Text style={styles.profileRole} numberOfLines={1}>{stageTitle}</Text>
          </View>
        </TouchableOpacity>

        {/* Period Pill */}
        <View style={styles.periodPill}>
          <Text style={styles.periodText}>Период {period}</Text>
        </View>
      </View>

      {/* Right Column: Balance & Settings */}
      <View style={styles.rightCol}>
        <View style={styles.rightCapsule}>
          {/* Coin Pill */}
          <View style={styles.coinPill}>
            <Image
              source={require('../../assets/coin.png')}
              style={styles.coinIcon}
              resizeMode="contain"
            />
            <Text style={styles.coinText}>{coins}</Text>
          </View>

          {/* Settings Button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onPressSettings}
            style={styles.settingsBtn}
          >
            <IconGear size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftCol: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillBrownDark,
    borderRadius: 30,
    paddingVertical: 3,
    paddingLeft: 3,
    paddingRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarBorder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#F7E3D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  profileTextContainer: {
    marginLeft: 10,
    justifyContent: 'center',
    maxWidth: 130,
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  profileRole: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 0.5,
  },
  periodPill: {
    backgroundColor: COLORS.pillBrownMedium,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillBrownDark,
    borderRadius: 26,
    padding: 4,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
    backdropFilter: 'blur(8px)',
  } as any,
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 4,
    paddingLeft: 5,
    paddingRight: 12,
    gap: 6,
  },
  coinIcon: {
    width: 26,
    height: 26,
  },
  coinText: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
  },
  settingsBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 4,
  },
  settingsIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 24,
  },
});
