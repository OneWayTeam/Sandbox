import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { FinnyCharacter } from '../components/FinnyCharacter';
import { COLORS } from '../theme/colors';
import {
  IconArrowBack,
  IconPalette,
  IconBrush,
  IconScarf,
  IconBeret,
  IconEasel,
  IconChair,
  IconCarrot,
  IconApple,
  IconTea,
  IconPaintTubes,
} from '../components/GameIcons';
import { ShopItem } from '../types/gameTypes';
import { INITIAL_SHOP_ITEMS } from '../state/gameData';
import { PurchaseModal } from '../components/PurchaseModal';
import { gameStore } from '../state/gameStore';

interface ShopScreenProps {
  coins: number;
  subCategory?: string;
  onBackToRoom: () => void;
  onNavigateToTasks?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ShopScreen: React.FC<ShopScreenProps> = ({
  coins,
  subCategory = 'all',
  onBackToRoom,
  onNavigateToTasks,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'mandatory' | 'discretionary'>('all');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  const items = INITIAL_SHOP_ITEMS;
  const filteredItems =
    filterType === 'all' ? items : items.filter((i) => i.type === filterType);

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'carrot':
        return <IconCarrot size={32} />;
      case 'apple':
        return <IconApple size={30} />;
      case 'brush_care':
        return <IconBrush size={30} />;
      case 'tea':
        return <IconTea size={30} />;
      case 'palette':
        return <IconPalette size={30} />;
      case 'paint_tubes':
        return <IconPaintTubes size={30} />;
      case 'scarf':
        return <IconScarf size={30} />;
      case 'beret':
        return <IconBeret size={30} />;
      case 'easel':
        return <IconEasel size={30} />;
      case 'chair':
        return <IconChair size={30} />;
      default:
        return <IconPalette size={30} />;
    }
  };

  const handleConfirmPurchase = (item: ShopItem) => {
    const res = gameStore.buyItem(item);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* 3D Scene Background */}
      <Image
        source={require('../../assets/scenes/shop.jpg')}
        style={styles.sceneBg}
        resizeMode="cover"
      />

      {/* Top HUD */}
      <View style={styles.topHud}>
        <TouchableOpacity style={styles.backPill} onPress={onBackToRoom} activeOpacity={0.85}>
          <IconArrowBack size={16} color="#FFFFFF" />
          <Text style={styles.backPillText}>В комнату</Text>
        </TouchableOpacity>

        <View style={styles.titlePill}>
          <Text style={styles.sceneTitle}>Лавка Финни</Text>
        </View>

        <View style={styles.coinPill}>
          <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      {/* Finny in the Store (Middle Layer) */}
      <View style={styles.characterLayer} pointerEvents="box-none">
        <FinnyCharacter />
      </View>

      {/* Bottom Catalog Drawer */}
      <View style={styles.catalogDrawer}>
        {/* Category Tabs (ТЗ 2.5.6: Обязательные vs Необязательные) */}
        <View style={styles.catRow}>
          <TouchableOpacity
            style={[styles.catChip, filterType === 'all' && styles.catChipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.catText, filterType === 'all' && styles.catTextActive]}>
              Все (10)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.catChip, filterType === 'mandatory' && styles.catChipActiveMandatory]}
            onPress={() => setFilterType('mandatory')}
          >
            <Text
              style={[
                styles.catText,
                filterType === 'mandatory' && styles.catTextActiveMandatory,
              ]}
            >
              Обязательные (еда/уход)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.catChip,
              filterType === 'discretionary' && styles.catChipActiveDiscretionary,
            ]}
            onPress={() => setFilterType('discretionary')}
          >
            <Text
              style={[
                styles.catText,
                filterType === 'discretionary' && styles.catTextActiveDiscretionary,
              ]}
            >
              Желания (радость)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.itemScroll}
        >
          {filteredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => setSelectedItem(item)}
              activeOpacity={0.85}
            >
              {/* Type pill */}
              <View
                style={[
                  styles.itemTypeBadge,
                  item.type === 'mandatory'
                    ? styles.badgeMandatory
                    : styles.badgeDiscretionary,
                ]}
              >
                <Text
                  style={[
                    styles.itemTypeBadgeText,
                    item.type === 'mandatory'
                      ? styles.badgeTextMandatory
                      : styles.badgeTextDiscretionary,
                  ]}
                >
                  {item.type === 'mandatory' ? 'Обязательное' : 'Желание'}
                </Text>
              </View>

              <View style={styles.iconCircle}>{getItemIcon(item.iconName)}</View>

              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>

              {/* Impact hint */}
              <Text style={styles.impactHint}>
                {item.satietyBoost > 0
                  ? `+${item.satietyBoost}% сытости`
                  : `+${item.moodBoost}% радости`}
              </Text>

              <View style={styles.priceRow}>
                <Image
                  source={require('../../assets/coin.png')}
                  style={styles.smallCoin}
                />
                <Text style={styles.priceText}>{item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Interactive Purchase & Shortage Modal */}
      <PurchaseModal
        visible={!!selectedItem}
        item={selectedItem}
        coins={coins}
        onConfirm={handleConfirmPurchase}
        onClose={() => setSelectedItem(null)}
        onNavigateToTasks={onNavigateToTasks}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FAF5EE',
  },
  sceneBg: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  topHud: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  backPillText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  titlePill: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sceneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  coinText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  characterLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '16%',
    bottom: '26%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  catalogDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingBottom: 20,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  catRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  catChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  catChipActiveMandatory: {
    backgroundColor: '#16A34A',
    borderColor: '#15803D',
  },
  catChipActiveDiscretionary: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  catText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  catTextActive: {
    color: '#FFFFFF',
  },
  catTextActiveMandatory: {
    color: '#FFFFFF',
  },
  catTextActiveDiscretionary: {
    color: '#FFFFFF',
  },
  itemScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  itemCard: {
    width: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeMandatory: {
    backgroundColor: '#DCFCE7',
  },
  badgeDiscretionary: {
    backgroundColor: '#FEF3C7',
  },
  itemTypeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  badgeTextMandatory: {
    color: '#15803D',
  },
  badgeTextDiscretionary: {
    color: '#B45309',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 2,
  },
  impactHint: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  smallCoin: {
    width: 14,
    height: 14,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F172A',
  },
});
