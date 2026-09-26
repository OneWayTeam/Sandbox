import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme/colors';
import { IconSparkleStar } from './GameIcons';

interface GoalCardProps {
  title?: string;
  category?: string;
  currentCoins?: number;
  totalCoins?: number;
  percentage?: number;
  onPress?: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  title = 'На набор красок',
  category = 'Комната юного художника',
  currentCoins = 32,
  totalCoins = 160,
  percentage = 20,
  onPress,
}) => {
  // Sparkle star pulsing animation
  const sparkleScale = useRef(new Animated.Value(1)).current;
  const sparkleRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(sparkleScale, { toValue: 1.25, duration: 800, useNativeDriver: true }),
          Animated.timing(sparkleRotate, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(sparkleScale, { toValue: 1.0, duration: 800, useNativeDriver: true }),
          Animated.timing(sparkleRotate, { toValue: 2, duration: 800, useNativeDriver: true }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const spin = sparkleRotate.interpolate({
    inputRange: [0, 2],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      {/* Title above card */}
      <Text style={styles.sectionHeader}>Главная цель Финни</Text>

      {/* Main Goal Card */}
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        style={styles.card}
      >
        {/* Top Row: Icon + Title/Subtitle + Status Badge */}
        <View style={styles.topRow}>
          {/* Gold Bars Badge */}
          <View style={styles.goldBadge}>
            <Image
              source={require('../../assets/gold_bars.png')}
              style={styles.goldImg}
              resizeMode="contain"
            />
          </View>

          {/* Texts */}
          <View style={styles.textCol}>
            <Text style={styles.goalTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.goalSubtitle} numberOfLines={1}>{category}</Text>
          </View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>АКТИВНА</Text>
          </View>
        </View>

        {/* Middle Row: Progress Bar */}
        <View style={styles.progressContainer}>
          {/* Track */}
          <View style={styles.progressTrack}>
            {/* Filled Violet Gradient */}
            <LinearGradient
              colors={[COLORS.purpleStart, COLORS.purpleMid, COLORS.purpleEnd]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.progressFill, { width: `${percentage}%` }]}
            />
          </View>

          {/* Tip Sparkle Star at percentage% */}
          <Animated.View
            style={[
              styles.sparklePoint,
              {
                left: `${percentage}%`,
                transform: [{ scale: sparkleScale }, { rotate: spin }],
              },
            ]}
          >
            <IconSparkleStar size={20} />
          </Animated.View>

          {/* Star Medal Marker at the End */}
          <View style={styles.medalMarker}>
            <Image
              source={require('../../assets/medal.png')}
              style={styles.medalImg}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Row: 20% and 32 из 160 монет */}
        <View style={styles.bottomRow}>
          <Text style={styles.percentText}>{percentage}%</Text>
          <Text style={styles.coinsText}>
            Накоплено: {currentCoins} из {totalCoins} монет
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
    zIndex: 15,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goldBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFF0E5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  goldImg: {
    width: 44,
    height: 44,
  },
  textCol: {
    flex: 1,
    marginLeft: 12,
  },
  goalTitle: {
    color: '#1E293B',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  goalSubtitle: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: COLORS.accentGreen,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  progressContainer: {
    position: 'relative',
    marginTop: 14,
    marginBottom: 8,
    height: 24,
    justifyContent: 'center',
  },
  progressTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EAE6FD',
    overflow: 'hidden',
    marginRight: 18,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    shadowColor: COLORS.purpleEnd,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  sparklePoint: {
    position: 'absolute',
    marginLeft: -10,
    top: 2,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  sparkleStar: {
    color: '#FBBF24',
    fontSize: 18,
    textShadowColor: '#C084FC',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  medalMarker: {
    position: 'absolute',
    right: 0,
    top: 2,
    width: 20,
    height: 20,
    zIndex: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medalImg: {
    width: 20,
    height: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  coinsText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
