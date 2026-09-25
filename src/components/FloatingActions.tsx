import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../theme/colors';

interface FloatingActionsProps {
  onCollectPress?: () => void;
  onShopPress?: () => void;
  onScratchPress?: () => void;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onCollectPress,
  onShopPress,
  onScratchPress,
}) => {
  // Stable scale on press (no spontaneous bobbing/floating)
  const scale1 = useRef(new Animated.Value(1)).current;
  const scale2 = useRef(new Animated.Value(1)).current;
  const scale3 = useRef(new Animated.Value(1)).current;

  const handlePressIn = (scale: Animated.Value) => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  };

  const handlePressOut = (scale: Animated.Value) => {
    Animated.spring(scale, { toValue: 1, friction: 4, tension: 40, useNativeDriver: true }).start();
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* 1. Gift Button (Собрать) */}
      <Animated.View style={[styles.itemWrapper, { transform: [{ scale: scale1 }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => handlePressIn(scale1)}
          onPressOut={() => handlePressOut(scale1)}
          onPress={onCollectPress}
          style={styles.touchTarget}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/gift_box.png')}
              style={styles.giftIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.labelPill}>
            <Text style={styles.labelText}>Собрать</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 2. Shop Button (Магазин) */}
      <Animated.View style={[styles.itemWrapper, { transform: [{ scale: scale2 }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => handlePressIn(scale2)}
          onPressOut={() => handlePressOut(scale2)}
          onPress={onShopPress}
          style={styles.touchTarget}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/shop_stall.png')}
              style={styles.shopIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.labelPill}>
            <Text style={styles.labelText}>Магазин</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* 3. Scratch Card Button (Стереть) */}
      <Animated.View style={[styles.itemWrapper, { transform: [{ scale: scale3 }] }]}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => handlePressIn(scale3)}
          onPressOut={() => handlePressOut(scale3)}
          onPress={onScratchPress}
          style={styles.touchTarget}
        >
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/scratch_card.png')}
              style={styles.scratchIcon}
              resizeMode="contain"
            />
          </View>
          <View style={[styles.labelPill, styles.scratchLabelPill]}>
            <Text style={styles.scratchLabelText}>Стереть</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 14,
    top: 98,
    zIndex: 15,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 14,
  },
  itemWrapper: {
    alignItems: 'center',
  },
  touchTarget: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  giftIcon: {
    width: 66,
    height: 66,
  },
  shopIcon: {
    width: 62,
    height: 62,
  },
  scratchIcon: {
    width: 56,
    height: 56,
  },
  labelPill: {
    backgroundColor: COLORS.pillPeachLight,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
    marginTop: -4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  labelText: {
    color: COLORS.pillPeachDarkText,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  scratchLabelPill: {
    backgroundColor: COLORS.accentOrange,
  },
  scratchLabelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
