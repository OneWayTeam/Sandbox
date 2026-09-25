import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { FinnyCharacter } from '../components/FinnyCharacter';
import { COLORS } from '../theme/colors';
import {
  IconArrowBack,
  IconTarget,
  IconSparkleStar,
  IconEasel,
  IconTrophy,
  IconCheck,
} from '../components/GameIcons';
import { FinancialGoal } from '../types/gameTypes';
import { WithdrawModal } from '../components/WithdrawModal';
import { gameStore } from '../state/gameStore';

interface SavingsScreenProps {
  coins: number;
  goals: FinancialGoal[];
  activeGoalId: string;
  onDeposit: (amount: number) => void;
  onBackToRoom: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SavingsScreen: React.FC<SavingsScreenProps> = ({
  coins,
  goals,
  activeGoalId,
  onDeposit,
  onBackToRoom,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(activeGoalId || goals[0]?.id);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const percent = Math.min(
    100,
    Math.round((currentGoal.savedAmount / currentGoal.totalCost) * 100)
  );
  const remaining = Math.max(0, currentGoal.totalCost - currentGoal.savedAmount);

  // Time horizon estimation (assumes 10 coins per period)
  const estimatedPeriods = Math.ceil(remaining / 10);

  const handleSelectGoal = (id: string) => {
    setSelectedGoalId(id);
    gameStore.selectGoal(id);
  };

  const handleWithdrawConfirm = (amount: number) => {
    const res = gameStore.withdrawFromGoal(amount);
    if (!res.success) {
      alert(res.message);
    }
  };

  const getGoalIcon = (iconName: string) => {
    switch (iconName) {
      case 'easel':
        return <IconEasel size={24} />;
      case 'trophy':
        return <IconTrophy size={24} color="#D97706" />;
      default:
        return (
          <Image
            source={require('../../assets/gold_bars.png')}
            style={styles.goldBarsMini}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* 3D Bank Vault Scene */}
      <Image
        source={require('../../assets/scenes/bank.jpg')}
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
          <Text style={styles.sceneTitle}>Золотой Сейф Финни</Text>
        </View>

        <View style={styles.coinPill}>
          <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      {/* Finny in front of the Vault Safe */}
      <View style={styles.characterLayer} pointerEvents="box-none">
        <FinnyCharacter />
      </View>

      {/* Bottom Vault Control Card */}
      <View style={styles.vaultDrawer}>
        {/* Goal Selector Chips (ТЗ 2.5.7: не менее 3 целей) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.goalChipsRow}
        >
          {goals.map((g) => (
            <TouchableOpacity
              key={g.id}
              style={[
                styles.goalChip,
                g.id === selectedGoalId && styles.goalChipActive,
              ]}
              onPress={() => handleSelectGoal(g.id)}
            >
              {getGoalIcon(g.iconName)}
              <Text
                style={[
                  styles.goalChipText,
                  g.id === selectedGoalId && styles.goalChipTextActive,
                ]}
              >
                {g.title}
              </Text>
              {g.id === activeGoalId && (
                <View style={styles.activeDot} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Selected Goal Details */}
        <View style={styles.vaultHeaderRow}>
          <View style={styles.vaultTextCol}>
            <Text style={styles.vaultGoalTitle}>{currentGoal.title}</Text>
            <Text style={styles.vaultGoalDesc}>{currentGoal.description}</Text>
          </View>
        </View>

        {/* Progress Bar & Numbers */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabelLeft}>
              Накоплено: {currentGoal.savedAmount} из {currentGoal.totalCost} монет
            </Text>
            <Text style={styles.progressLabelRight}>{percent}%</Text>
          </View>

          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
          </View>

          {/* Time Horizon (ТЗ 2.5.7) */}
          <Text style={styles.timeHorizonText}>
            Осталось накопить: {remaining} монет (~{estimatedPeriods} периодов при +10 монет за период)
          </Text>
        </View>

        {/* Action Buttons: Deposit vs Withdraw */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.depositBtn, coins < 5 && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={() => onDeposit(5)}
            disabled={coins < 5}
          >
            <Image source={require('../../assets/coin.png')} style={styles.depositCoin} />
            <Text style={styles.depositBtnText}>Отложить +5</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.depositBtn, coins < 10 && styles.btnDisabled]}
            activeOpacity={0.85}
            onPress={() => onDeposit(10)}
            disabled={coins < 10}
          >
            <Image source={require('../../assets/coin.png')} style={styles.depositCoin} />
            <Text style={styles.depositBtnText}>Отложить +10</Text>
          </TouchableOpacity>

          {/* Withdraw button (ТЗ 2.5.7: только с отдельным подтверждением) */}
          <TouchableOpacity
            style={[
              styles.withdrawBtn,
              currentGoal.savedAmount < 10 && styles.btnDisabled,
            ]}
            activeOpacity={0.85}
            onPress={() => setWithdrawModalVisible(true)}
            disabled={currentGoal.savedAmount < 10}
          >
            <Text style={styles.withdrawBtnText}>Снять 10</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Safety Withdrawal Confirmation Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        goal={currentGoal}
        onConfirmWithdraw={handleWithdrawConfirm}
        onClose={() => setWithdrawModalVisible(false)}
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
  vaultDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingBottom: 22,
    paddingHorizontal: 16,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  goalChipsRow: {
    gap: 8,
    marginBottom: 12,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  goalChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  goalChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  goalChipTextActive: {
    color: '#92400E',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  goldBarsMini: {
    width: 18,
    height: 18,
  },
  vaultHeaderRow: {
    marginBottom: 8,
  },
  vaultTextCol: {
    flex: 1,
  },
  vaultGoalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  vaultGoalDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  progressContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabelLeft: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  progressLabelRight: {
    fontSize: 12,
    fontWeight: '800',
    color: '#D97706',
  },
  progressBarBg: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 5,
  },
  timeHorizonText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  depositBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  depositCoin: {
    width: 18,
    height: 18,
  },
  depositBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  withdrawBtn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  btnDisabled: {
    opacity: 0.45,
  },
});
