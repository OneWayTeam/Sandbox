import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { ShopItem } from '../types/gameTypes';
import {
  IconApple,
  IconPalette,
  IconCheck,
  IconArrowBack,
  IconSparkleStar,
} from './GameIcons';

interface PurchaseModalProps {
  visible: boolean;
  item: ShopItem | null;
  coins: number;
  onConfirm: (item: ShopItem) => void;
  onClose: () => void;
  onNavigateToTasks?: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  visible,
  item,
  coins,
  onConfirm,
  onClose,
  onNavigateToTasks,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const canAfford = coins >= item.price;
  const shortage = item.price - coins;

  const handleConfirmPress = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    onConfirm(item);
    onClose();
    setTimeout(() => {
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View
              style={[
                styles.typeTag,
                item.type === 'mandatory' ? styles.typeTagMandatory : styles.typeTagDiscretionary,
              ]}
            >
              {item.type === 'mandatory' ? (
                <IconApple size={16} />
              ) : (
                <IconPalette size={16} />
              )}
              <Text
                style={[
                  styles.typeTagText,
                  item.type === 'mandatory'
                    ? styles.typeTagTextMandatory
                    : styles.typeTagTextDiscretionary,
                ]}
              >
                {item.type === 'mandatory'
                  ? 'Обязательный расход (Еда и уход)'
                  : 'Необязательный расход (Желание)'}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>

            {/* Category & Price Badge */}
            <View style={styles.detailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Категория:</Text>
                <Text style={styles.detailValue}>
                  {(item as any).categoryLabel ||
                    (item.category === 'food'
                      ? 'Еда и питание'
                      : item.category === 'care'
                      ? 'Уход и здоровье'
                      : item.category === 'toy'
                      ? 'Игрушки'
                      : item.category === 'decoration'
                      ? 'Украшения'
                      : item.category === 'accessory' || item.category === 'clothes'
                      ? 'Аксессуары'
                      : item.category === 'entertainment'
                      ? 'Развлечения'
                      : item.category === 'furniture'
                      ? 'Интерьер'
                      : 'Творчество')}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Стоимость:</Text>
                <View style={styles.priceBadge}>
                  <Image
                    source={require('../../assets/coin.png')}
                    style={styles.coinIcon}
                  />
                  <Text style={styles.priceValue}>{item.price} монет</Text>
                </View>
              </View>
            </View>

            {/* Impact on Pet (ТЗ 2.5.6) */}
            <View style={styles.impactCard}>
              <Text style={styles.impactTitle}>Влияние на питомца:</Text>
              <View style={styles.impactTags}>
                {item.satietyBoost > 0 && (
                  <View style={styles.boostPillGreen}>
                    <Text style={styles.boostPillGreenText}>
                      Сытость: +{item.satietyBoost}%
                    </Text>
                  </View>
                )}
                {item.moodBoost > 0 && (
                  <View style={styles.boostPillOrange}>
                    <Text style={styles.boostPillOrangeText}>
                      Настроение: +{item.moodBoost}%
                    </Text>
                  </View>
                )}
              </View>
              {(item as any).petEffect?.description && (
                <Text style={styles.petEffectDesc}>{(item as any).petEffect.description}</Text>
              )}
            </View>

            {/* Remaining balance preview */}
            {canAfford && (
              <View style={styles.remainingBox}>
                <Text style={styles.remainingLabel}>Остаток монет после покупки:</Text>
                <View style={styles.remainingValueRow}>
                  <Image source={require('../../assets/coin.png')} style={styles.smallCoinIcon} />
                  <Text style={styles.remainingValueText}>{coins - item.price} монет</Text>
                </View>
              </View>
            )}

            {/* Shortage Handling vs Purchase Button */}
            {!canAfford ? (
              // EXPLANATION OF SHORTAGE (ТЗ 2.5.6)
              <View style={styles.shortageBox}>
                <Text style={styles.shortageTitle}>Покупка заблокирована: не хватает средств!</Text>
                <Text style={styles.shortageText}>
                  В кошельке сейчас {coins} монет, а нужно {item.price}. Не хватает ещё {shortage} монет.
                </Text>

                <View style={styles.recoverySection}>
                  <Text style={styles.recoveryHeader}>Как исправить и восстановить баланс:</Text>
                  <View style={styles.adviceList}>
                    <Text style={styles.adviceItem}>• Выполни обучающее задание в парке (+10 монет)</Text>
                    <Text style={styles.adviceItem}>• Скорректируй бюджет или заверши игровой период (+25 монет)</Text>
                    <Text style={styles.adviceItem}>• Отложи покупку необязательных вещей на следующий раз</Text>
                  </View>
                </View>

                {onNavigateToTasks && (
                  <TouchableOpacity
                    style={styles.goToTasksBtn}
                    onPress={() => {
                      onClose();
                      onNavigateToTasks();
                    }}
                    activeOpacity={0.85}
                  >
                    <IconSparkleStar size={18} />
                    <Text style={styles.goToTasksBtnText}>Заработать монеты в заданиях</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.confirmBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleConfirmPress}
                disabled={isSubmitting}
                activeOpacity={0.85}
              >
                <IconCheck size={20} color="#FFFFFF" />
                <Text style={styles.confirmBtnText}>
                  {isSubmitting ? 'Обработка...' : `Подтвердить покупку (${item.price} монет)`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  typeTagMandatory: {
    backgroundColor: '#DCFCE7',
  },
  typeTagDiscretionary: {
    backgroundColor: '#FEF3C7',
  },
  typeTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  typeTagTextMandatory: {
    color: '#15803D',
  },
  typeTagTextDiscretionary: {
    color: '#B45309',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#475569',
  },
  content: {
    padding: 20,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  itemDesc: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  priceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coinIcon: {
    width: 22,
    height: 22,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
  },
  impactCard: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  impactTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  impactTags: {
    flexDirection: 'row',
    gap: 8,
  },
  boostPillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  boostPillGreenText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  boostPillOrange: {
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  boostPillOrangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C2410C',
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  shortageBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  shortageTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
    marginBottom: 4,
  },
  shortageText: {
    fontSize: 12,
    color: '#991B1B',
    lineHeight: 18,
    marginBottom: 10,
  },
  adviceList: {
    gap: 4,
    marginBottom: 12,
  },
  adviceItem: {
    fontSize: 12,
    color: '#7F1D1D',
    fontWeight: '600',
  },
  goToTasksBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 12,
  },
  goToTasksBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  detailBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  petEffectDesc: {
    fontSize: 11,
    color: '#334155',
    marginTop: 6,
    fontStyle: 'italic',
  },
  remainingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  remainingLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#166534',
  },
  remainingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallCoinIcon: {
    width: 16,
    height: 16,
  },
  remainingValueText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#15803D',
  },
  recoverySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  recoveryHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 6,
  },
});
