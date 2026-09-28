import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { COLORS } from '../theme/colors';

export type GameLocation = 'room' | 'plan' | 'shop' | 'savings' | 'tasks';

interface BottomTabBarProps {
  currentLocation: GameLocation;
  onNavigate: (location: GameLocation) => void;
  subCategory?: string;
  onSubCategoryChange?: (category: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentLocation,
  onNavigate,
}) => {
  return (
    <View style={styles.container}>
      {/* 1. Комната */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('room')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, currentLocation === 'room' && styles.activeIconPill]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z"
              stroke={currentLocation === 'room' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path
              d="M9 21V12H15V21"
              stroke={currentLocation === 'room' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, currentLocation === 'room' ? styles.activeLabel : styles.inactiveLabel]}>
          Комната
        </Text>
      </TouchableOpacity>

      {/* 2. План */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('plan')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, currentLocation === 'plan' && styles.activeIconPill]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Rect
              x={5}
              y={4}
              width={14}
              height={17}
              rx={2}
              stroke={currentLocation === 'plan' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
            />
            <Path
              d="M9 2H15V5H9V2Z"
              stroke={currentLocation === 'plan' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={1.8}
              strokeLinejoin="round"
            />
            <Path
              d="M8.5 10H15.5M8.5 14H15.5M8.5 17.5H12.5"
              stroke={currentLocation === 'plan' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
            />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, currentLocation === 'plan' ? styles.activeLabel : styles.inactiveLabel]}>
          План
        </Text>
      </TouchableOpacity>

      {/* 3. Магазин */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('shop')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, currentLocation === 'shop' && styles.activeIconPill]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 3H5.5L7.8 14.2C7.9 14.7 8.3 15 8.8 15H18.2C18.7 15 19.1 14.7 19.2 14.2L21 6H6"
              stroke={currentLocation === 'shop' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Circle cx={9} cy={19} r={1.8} stroke={currentLocation === 'shop' ? COLORS.primary : COLORS.textSecondary} strokeWidth={2} />
            <Circle cx={18} cy={19} r={1.8} stroke={currentLocation === 'shop' ? COLORS.primary : COLORS.textSecondary} strokeWidth={2} />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, currentLocation === 'shop' ? styles.activeLabel : styles.inactiveLabel]}>
          Магазин
        </Text>
      </TouchableOpacity>

      {/* 4. Копилка */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('savings')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, currentLocation === 'savings' && styles.activeIconPill]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Path
              d="M19 12C19 8.5 15.5 6 12 6C7.5 6 4 9 4 13C4 16 6.5 18 10 18V20H13V18C13.5 18 14 17.9 14.5 17.8L16.5 20H19V17C20.5 15.5 21 13.8 21 12H19Z"
              stroke={currentLocation === 'savings' ? COLORS.primary : COLORS.textSecondary}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <Path d="M10 6V4H13V6" stroke={currentLocation === 'savings' ? COLORS.primary : COLORS.textSecondary} strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, currentLocation === 'savings' ? styles.activeLabel : styles.inactiveLabel]}>
          Копилка
        </Text>
      </TouchableOpacity>

      {/* 5. Задания */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('tasks')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, currentLocation === 'tasks' && styles.activeIconPill]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={9} stroke={currentLocation === 'tasks' ? COLORS.primary : COLORS.textSecondary} strokeWidth={2} />
            <Path d="M8.5 12L11 14.5L16 9.5" stroke={currentLocation === 'tasks' ? COLORS.primary : COLORS.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, currentLocation === 'tasks' ? styles.activeLabel : styles.inactiveLabel]}>
          Задания
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 25,
  },
  tabItem: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 58,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconPill: {
    backgroundColor: COLORS.primaryLight,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 3,
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  inactiveLabel: {
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});
