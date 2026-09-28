import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 1. Reward Collect Modal (Раз в сутки)
interface CollectModalProps {
  visible: boolean;
  isAvailable?: boolean;
  petName?: string;
  onClose: () => void;
  onClaim: (amount: number) => void;
}

export const CollectModal: React.FC<CollectModalProps> = ({
  visible,
  isAvailable = true,
  petName = 'Твой питомец',
  onClose,
  onClaim,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Image
            source={require('../../assets/gift_box.png')}
            style={styles.modalGiftImg}
            resizeMode="contain"
          />
          <Text style={styles.modalTitle}>Ежедневная награда!</Text>

          {isAvailable ? (
            <>
              <Text style={styles.modalSubtitle}>
                {petName} подготовил для тебя подарок за хорошую заботу! Награда доступна 1 раз в сутки.
              </Text>

              <View style={styles.rewardBox}>
                <Image
                  source={require('../../assets/coin.png')}
                  style={styles.rewardCoin}
                  resizeMode="contain"
                />
                <Text style={styles.rewardText}>+10 монет</Text>
              </View>

              <TouchableOpacity
                style={styles.primaryBtn}
                activeOpacity={0.85}
                onPress={() => {
                  onClaim(10);
                  onClose();
                }}
              >
                <Text style={styles.primaryBtnText}>Собрать награду</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.alreadyClaimedBadge}>
                <Text style={styles.alreadyClaimedBadgeText}>✓ Уже получено сегодня</Text>
              </View>
              <Text style={styles.modalSubtitle}>
                Ежедневную награду можно получать только один раз в сутки. Завтра тебя будет ждать новый подарок!
              </Text>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={onClose}
              >
                <Text style={styles.secondaryBtnText}>Понятно</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// 2. Scratch Card Modal with REAL interactive scratching (Раз в сутки)
interface ScratchModalProps {
  visible: boolean;
  isAvailable?: boolean;
  onClose: () => void;
  onReward: (amount: number) => void;
}

const GRID_COLS = 10;
const GRID_ROWS = 5;
const TOTAL_TILES = GRID_COLS * GRID_ROWS;
const CARD_WIDTH = 280;
const CARD_HEIGHT = 140;
const TILE_W = CARD_WIDTH / GRID_COLS;
const TILE_H = CARD_HEIGHT / GRID_ROWS;

export const ScratchModal: React.FC<ScratchModalProps> = ({
  visible,
  isAvailable = true,
  onClose,
  onReward,
}) => {
  const [scratchedTiles, setScratchedTiles] = useState<number[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);

  const handleScratchAt = (x: number, y: number) => {
    if (isRevealed || !isAvailable) return;
    const col = Math.floor(x / TILE_W);
    const row = Math.floor(y / TILE_H);
    if (col < 0 || col >= GRID_COLS || row < 0 || row >= GRID_ROWS) return;

    // Erase center tile plus immediate neighboring tiles for realistic brush stroke
    const toAdd: number[] = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          toAdd.push(r * GRID_COLS + c);
        }
      }
    }

    setScratchedTiles((prev) => {
      const next = new Set([...prev, ...toAdd]);
      if (next.size / TOTAL_TILES >= 0.42 && !isRevealed) {
        setIsRevealed(true);
      }
      return Array.from(next);
    });
  };

  const handleTouch = (evt: any) => {
    const { locationX, locationY } = evt.nativeEvent;
    if (locationX !== undefined && locationY !== undefined) {
      handleScratchAt(locationX, locationY);
    }
  };

  const percentScratched = Math.min(100, Math.round((scratchedTiles.length / TOTAL_TILES) * 100));

  const handleCloseModal = () => {
    setScratchedTiles([]);
    setIsRevealed(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCloseModal}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Счастливый билет!</Text>

          {isAvailable ? (
            <>
              <Text style={styles.modalSubtitle}>
                Сотри защитный слой пальцем или курсором мыши, чтобы узнать выигрыш! (1 раз в сутки)
              </Text>

              {/* REAL INTERACTIVE SCRATCH SURFACE */}
              <View
                style={[styles.scratchInteractiveContainer, isRevealed && styles.scratchBorderWin]}
                onTouchMove={handleTouch}
                onTouchStart={handleTouch}
                // @ts-ignore Web mouse drag support
                onMouseMove={(e: any) => {
                  if (e.buttons === 1) {
                    const rect = e.currentTarget?.getBoundingClientRect?.();
                    if (rect) {
                      handleScratchAt(e.clientX - rect.left, e.clientY - rect.top);
                    }
                  }
                }}
              >
                {/* PRIZE UNDERNEATH */}
                <View style={styles.scratchUnderLayer}>
                  <Image
                    source={require('../../assets/coin.png')}
                    style={styles.scratchCoin}
                    resizeMode="contain"
                  />
                  <Text style={styles.scratchWinBigText}>+15 МОНЕТ!</Text>
                  <Text style={styles.scratchWinSub}>Твой счастливый куш!</Text>
                </View>

                {/* SCRATCH FOIL TILES LAYER */}
                {!isRevealed && (
                  <View style={styles.scratchFoilGrid} pointerEvents="none">
                    {Array.from({ length: TOTAL_TILES }).map((_, idx) => {
                      const isCleared = scratchedTiles.includes(idx);
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.scratchTile,
                            { width: TILE_W, height: TILE_H },
                            isCleared && styles.scratchTileCleared,
                          ]}
                        />
                      );
                    })}
                  </View>
                )}

                {/* Helper prompt over foil */}
                {!isRevealed && scratchedTiles.length < 5 && (
                  <View style={styles.scratchHintBadge} pointerEvents="none">
                    <Text style={styles.scratchHintText}>🖐 Потри здесь, чтобы стереть!</Text>
                  </View>
                )}
              </View>

              {/* Live progress indicator */}
              {!isRevealed && (
                <View style={styles.scratchProgressRow}>
                  <Text style={styles.scratchProgressText}>
                    Стерто: {percentScratched}% (потри еще чуть-чуть)
                  </Text>
                </View>
              )}

              {isRevealed ? (
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: '#16A34A', marginTop: 12 }]}
                  activeOpacity={0.85}
                  onPress={() => {
                    onReward(15);
                    handleCloseModal();
                  }}
                >
                  <Text style={styles.primaryBtnText}>🎉 Забрать +15 монет!</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  activeOpacity={0.85}
                  onPress={handleCloseModal}
                >
                  <Text style={styles.secondaryBtnText}>Отложить на потом</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              <View style={styles.alreadyClaimedBadge}>
                <Text style={styles.alreadyClaimedBadgeText}>⏳ Уже использован сегодня</Text>
              </View>
              <Text style={styles.modalSubtitle}>
                Счастливый билет можно стирать только один раз в сутки. Приходи завтра за новым билетом!
              </Text>
              <TouchableOpacity
                style={styles.secondaryBtn}
                activeOpacity={0.85}
                onPress={handleCloseModal}
              >
                <Text style={styles.secondaryBtnText}>Понятно</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};



const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 10, 5, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  modalGiftImg: {
    width: 88,
    height: 88,
    marginBottom: 12,
  },
  goalModalIcon: {
    width: 76,
    height: 76,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 10,
    marginBottom: 20,
  },
  rewardCoin: {
    width: 32,
    height: 32,
  },
  rewardText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D97706',
  },
  alreadyClaimedBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  alreadyClaimedBadgeText: {
    color: '#B45309',
    fontSize: 14,
    fontWeight: '800',
  },
  scratchInteractiveContainer: {
    width: 280,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#FDE68A',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scratchBorderWin: {
    borderColor: '#16A34A',
    borderWidth: 3,
  },
  scratchUnderLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  scratchWinBigText: {
    color: '#D97706',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  scratchWinSub: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
  },
  scratchFoilGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
    zIndex: 10,
  },
  scratchTile: {
    backgroundColor: '#3B82F6',
    borderWidth: 0.5,
    borderColor: '#2563EB',
  },
  scratchTileCleared: {
    opacity: 0,
  },
  scratchHintBadge: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 58, 138, 0.88)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    zIndex: 20,
  },
  scratchHintText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scratchProgressRow: {
    marginBottom: 8,
  },
  scratchProgressText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  scratchCoin: {
    width: 44,
    height: 44,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  toggleBtn: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  toggleActive: {
    backgroundColor: COLORS.accentGreen,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  progressSummary: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.purpleStart,
    marginTop: 4,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
