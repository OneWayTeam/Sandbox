import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Image } from 'react-native';
import Svg, { Path, Rect, Circle } from 'react-native-svg';
import { COLORS } from '../theme/colors';
import {
  IconScarf,
  IconChair,
  IconPalette,
  IconBackpack,
  IconTarget,
  IconScroll,
  IconTrophy,
} from './GameIcons';

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
  subCategory = 'all',
  onSubCategoryChange,
}) => {
  // If in Room or Plan, show the canonical game world tabs (Screenshot 1)
  if (currentLocation === 'room' || currentLocation === 'plan') {
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
          <View style={styles.iconWrapper}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M3 3H5.5L7.8 14.2C7.9 14.7 8.3 15 8.8 15H18.2C18.7 15 19.1 14.7 19.2 14.2L21 6H6"
                stroke={COLORS.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Circle cx={9} cy={19} r={1.8} stroke={COLORS.textSecondary} strokeWidth={2} />
              <Circle cx={18} cy={19} r={1.8} stroke={COLORS.textSecondary} strokeWidth={2} />
            </Svg>
          </View>
          <Text style={[styles.tabLabel, styles.inactiveLabel]}>Магазин</Text>
        </TouchableOpacity>

        {/* 4. Копилка */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('savings')}
          style={styles.tabItem}
        >
          <View style={styles.iconWrapper}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12C19 8.5 15.5 6 12 6C7.5 6 4 9 4 13C4 16 6.5 18 10 18V20H13V18C13.5 18 14 17.9 14.5 17.8L16.5 20H19V17C20.5 15.5 21 13.8 21 12H19Z"
                stroke={COLORS.textSecondary}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <Path d="M10 6V4H13V6" stroke={COLORS.textSecondary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          </View>
          <Text style={[styles.tabLabel, styles.inactiveLabel]}>Копилка</Text>
        </TouchableOpacity>

        {/* 5. Задания */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('tasks')}
          style={styles.tabItem}
        >
          <View style={styles.iconWrapper}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke={COLORS.textSecondary} strokeWidth={2} />
              <Path d="M8.5 12L11 14.5L16 9.5" stroke={COLORS.textSecondary} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={[styles.tabLabel, styles.inactiveLabel]}>Задания</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // SHOP CONTEXTUAL BAR
  if (currentLocation === 'shop') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('room')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, styles.backIconPill]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z" stroke="#D97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={[styles.tabLabel, styles.backLabel]}>В комнату</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('clothes')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'clothes' && styles.activeIconPill]}>
            <IconScarf size={22} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'clothes' ? styles.activeLabel : styles.inactiveLabel]}>Одежда</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('furniture')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'furniture' && styles.activeIconPill]}>
            <IconChair size={22} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'furniture' ? styles.activeLabel : styles.inactiveLabel]}>Мебель</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('art')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'art' && styles.activeIconPill]}>
            <IconPalette size={22} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'art' ? styles.activeLabel : styles.inactiveLabel]}>Краски</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('inventory')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'inventory' && styles.activeIconPill]}>
            <IconBackpack size={22} color={subCategory === 'inventory' ? COLORS.primary : COLORS.textSecondary} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'inventory' ? styles.activeLabel : styles.inactiveLabel]}>Рюкзак</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // BANK / SAVINGS CONTEXTUAL BAR
  if (currentLocation === 'savings') {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onNavigate('room')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, styles.backIconPill]}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z" stroke="#D97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={[styles.tabLabel, styles.backLabel]}>В комнату</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('vault')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'vault' && styles.activeIconPill]}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Rect x={3} y={4} width={18} height={16} rx={3} stroke={COLORS.primary} strokeWidth={2} />
              <Circle cx={12} cy={12} r={4} stroke={COLORS.primary} strokeWidth={2} />
            </Svg>
          </View>
          <Text style={[styles.tabLabel, subCategory === 'vault' ? styles.activeLabel : styles.inactiveLabel]}>Сейф</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('deposit')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'deposit' && styles.activeIconPill]}>
            <Image source={require('../../assets/coin.png')} style={{ width: 22, height: 22 }} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'deposit' ? styles.activeLabel : styles.inactiveLabel]}>В цель +5</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('goals')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'goals' && styles.activeIconPill]}>
            <IconTarget size={22} color={subCategory === 'goals' ? COLORS.primary : COLORS.textSecondary} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'goals' ? styles.activeLabel : styles.inactiveLabel]}>Мечты</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSubCategoryChange && onSubCategoryChange('history')}
          style={styles.tabItem}
        >
          <View style={[styles.iconWrapper, subCategory === 'history' && styles.activeIconPill]}>
            <IconScroll size={22} color={subCategory === 'history' ? COLORS.primary : COLORS.textSecondary} />
          </View>
          <Text style={[styles.tabLabel, subCategory === 'history' ? styles.activeLabel : styles.inactiveLabel]}>История</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // TASKS / PARK CONTEXTUAL BAR
  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onNavigate('room')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, styles.backIconPill]}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V10.5Z" stroke="#D97706" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, styles.backLabel]}>В комнату</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSubCategoryChange && onSubCategoryChange('quests')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, (subCategory === 'quests' || subCategory === 'all') && styles.activeIconPill]}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Rect x={5} y={4} width={14} height={17} rx={2} stroke={(subCategory === 'quests' || subCategory === 'all') ? COLORS.primary : COLORS.textSecondary} strokeWidth={2} />
            <Path d="M9 2H15V5H9V2Z" stroke={(subCategory === 'quests' || subCategory === 'all') ? COLORS.primary : COLORS.textSecondary} strokeWidth={1.8} />
          </Svg>
        </View>
        <Text style={[styles.tabLabel, (subCategory === 'quests' || subCategory === 'all') ? styles.activeLabel : styles.inactiveLabel]}>Все</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSubCategoryChange && onSubCategoryChange('budget')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, subCategory === 'budget' && styles.activeIconPill]}>
          <IconPalette size={22} />
        </View>
        <Text style={[styles.tabLabel, subCategory === 'budget' ? styles.activeLabel : styles.inactiveLabel]}>Бюджет</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSubCategoryChange && onSubCategoryChange('savings')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, subCategory === 'savings' && styles.activeIconPill]}>
          <IconTarget size={22} color={subCategory === 'savings' ? COLORS.primary : COLORS.textSecondary} />
        </View>
        <Text style={[styles.tabLabel, subCategory === 'savings' ? styles.activeLabel : styles.inactiveLabel]}>Сбережения</Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSubCategoryChange && onSubCategoryChange('trophies')}
        style={styles.tabItem}
      >
        <View style={[styles.iconWrapper, subCategory === 'trophies' && styles.activeIconPill]}>
          <IconTrophy size={22} color={subCategory === 'trophies' ? COLORS.primary : COLORS.textSecondary} />
        </View>
        <Text style={[styles.tabLabel, subCategory === 'trophies' ? styles.activeLabel : styles.inactiveLabel]}>Трофеи</Text>
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
  backIconPill: {
    backgroundColor: '#FFF0E5',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
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
  backLabel: {
    color: '#D97706',
    fontWeight: '700',
  },
});
