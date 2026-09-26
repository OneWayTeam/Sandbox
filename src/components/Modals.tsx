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

// 1. Reward Collect Modal
interface CollectModalProps {
  visible: boolean;
  onClose: () => void;
  onClaim: (amount: number) => void;
}

export const CollectModal: React.FC<CollectModalProps> = ({ visible, onClose, onClaim }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Image
            source={require('../../assets/gift_box.png')}
            style={styles.modalGiftImg}
            resizeMode="contain"
          />
          <Text style={styles.modalTitle}>Ежедневная награда!</Text>
          <Text style={styles.modalSubtitle}>
            Финни подготовил для тебя подарок за хорошую заботу!
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
        </View>
      </View>
    </Modal>
  );
};

// 2. Scratch Card Modal
interface ScratchModalProps {
  visible: boolean;
  onClose: () => void;
  onReward: (amount: number) => void;
}

export const ScratchModal: React.FC<ScratchModalProps> = ({ visible, onClose, onReward }) => {
  const [scratched, setScratched] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Счастливый билет!</Text>
          <Text style={styles.modalSubtitle}>
            Сотри защитный слой, чтобы узнать твой выигрыш
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setScratched(true)}
            style={[styles.scratchArea, scratched && styles.scratchedArea]}
          >
            {!scratched ? (
              <View style={styles.scratchCover}>
                <Text style={styles.scratchCoverText}>Нажми, чтобы стереть</Text>
              </View>
            ) : (
              <View style={styles.scratchResult}>
                <Image
                  source={require('../../assets/coin.png')}
                  style={styles.scratchCoin}
                  resizeMode="contain"
                />
                <Text style={styles.scratchWinText}>Вы выиграли +15 монет!</Text>
              </View>
            )}
          </TouchableOpacity>

          {scratched ? (
            <TouchableOpacity
              style={styles.primaryBtn}
              activeOpacity={0.85}
              onPress={() => {
                onReward(15);
                setScratched(false);
                onClose();
              }}
            >
              <Text style={styles.primaryBtnText}>Забрать приз</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.secondaryBtn}
              activeOpacity={0.85}
              onPress={onClose}
            >
              <Text style={styles.secondaryBtnText}>Закрыть</Text>
            </TouchableOpacity>
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
  scratchArea: {
    width: '100%',
    height: 120,
    backgroundColor: '#3B82F6',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scratchedArea: {
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  scratchCover: {
    padding: 20,
  },
  scratchCoverText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  scratchResult: {
    alignItems: 'center',
    gap: 8,
  },
  scratchCoin: {
    width: 44,
    height: 44,
  },
  scratchWinText: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '800',
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
