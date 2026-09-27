import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { FinnyCharacter3D } from '../components/FinnyCharacter3D';
import { COLORS } from '../theme/colors';
import {
  IconArrowBack,
  IconTarget,
  IconSparkleStar,
  IconEasel,
  IconTrophy,
  IconCheck,
  IconScroll,
  IconApple,
  IconPalette,
} from '../components/GameIcons';
import { FinancialGoal, GameTransaction } from '../types/gameTypes';
import { WithdrawModal } from '../components/WithdrawModal';
import { gameStore } from '../state/gameStore';
import { calculateGoalEstimatedPeriods } from '../state/gameData';

interface SavingsScreenProps {
  coins: number;
  goals: FinancialGoal[];
  activeGoalId: string;
  subCategory?: string;
  onDeposit: (amount: number) => void;
  onBackToRoom: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SavingsScreen: React.FC<SavingsScreenProps> = ({
  coins,
  goals,
  activeGoalId,
  subCategory = 'all',
  onDeposit,
  onBackToRoom,
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>(activeGoalId || goals[0]?.id);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'vault' | 'history'>(
    subCategory === 'history' ? 'history' : 'vault'
  );
  const [historyFilter, setHistoryFilter] = useState<'all' | 'income' | 'expense' | 'periods'>('all');
  const [isDepositing, setIsDepositing] = useState(false);

  const handleDeposit = (amount: number) => {
    if (isDepositing) return;
    setIsDepositing(true);
    onDeposit(amount);
    setTimeout(() => setIsDepositing(false), 400);
  };

  useEffect(() => {
    if (subCategory === 'history') {
      setActiveTab('history');
    } else if (subCategory === 'vault' || subCategory === 'goals') {
      setActiveTab('vault');
    }
  }, [subCategory]);

  const state = gameStore.getState();
  const transactions: GameTransaction[] = state.transactions || [];
  const periodSummaries = state.periodSummaries || [];

  const currentGoal = goals.find((g) => g.id === selectedGoalId) || goals[0];
  const percent = Math.min(
    100,
    Math.round((currentGoal.savedAmount / currentGoal.totalCost) * 100)
  );
  const remaining = Math.max(0, currentGoal.totalCost - currentGoal.savedAmount);

  // Honest time horizon estimation: only when empirical data or approved plan exists!
  const savingsHistory = periodSummaries.map((p) => p.fact.savings);
  const estimate = calculateGoalEstimatedPeriods(
    currentGoal,
    savingsHistory,
    state.budgetPlan.isApproved ? state.budgetPlan.savings : undefined
  );

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
        <FinnyCharacter3D />
      </View>

      {/* Bottom Vault & History Control Drawer */}
      <View style={styles.vaultDrawer}>
        {/* Drawer Mode Tabs */}
        <View style={styles.modeTabsRow}>
          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'vault' && styles.modeTabActive]}
            onPress={() => setActiveTab('vault')}
            activeOpacity={0.85}
          >
            <IconTarget size={16} color={activeTab === 'vault' ? '#92400E' : '#64748B'} />
            <Text style={[styles.modeTabText, activeTab === 'vault' && styles.modeTabTextActive]}>
              Сейф и цели
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, activeTab === 'history' && styles.modeTabActive]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.85}
          >
            <IconScroll size={16} color={activeTab === 'history' ? '#92400E' : '#64748B'} />
            <Text style={[styles.modeTabText, activeTab === 'history' && styles.modeTabTextActive]}>
              История ({transactions.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'vault' ? (
          <View>
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

              {/* Time Horizon (без ложной точности) */}
              <Text style={styles.timeHorizonText}>
                {remaining === 0
                  ? 'Цель достигнута! Финни гордится своими сбережениями! 🎉'
                  : `Осталось накопить: ${remaining} монет • ${estimate.displayText}`}
              </Text>
            </View>

            {/* Action Buttons: Deposit vs Withdraw */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.depositBtn, (coins < 5 || isDepositing) && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={() => handleDeposit(5)}
                disabled={coins < 5 || isDepositing}
              >
                <Image source={require('../../assets/coin.png')} style={styles.depositCoin} />
                <Text style={styles.depositBtnText}>{isDepositing ? '...' : 'Отложить +5'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.depositBtn, (coins < 10 || isDepositing) && styles.btnDisabled]}
                activeOpacity={0.85}
                onPress={() => handleDeposit(10)}
                disabled={coins < 10 || isDepositing}
              >
                <Image source={require('../../assets/coin.png')} style={styles.depositCoin} />
                <Text style={styles.depositBtnText}>{isDepositing ? '...' : 'Отложить +10'}</Text>
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
        ) : (
          // HISTORY OF TRANSACTIONS & PERIOD SUMMARIES (ТЗ: иметь историю)
          <View style={styles.historyContainer}>
            {/* Filter chips */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, historyFilter === 'all' && styles.filterChipActive]}
                onPress={() => setHistoryFilter('all')}
              >
                <Text style={[styles.filterText, historyFilter === 'all' && styles.filterTextActive]}>
                  Все ({transactions.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, historyFilter === 'income' && styles.filterChipActive]}
                onPress={() => setHistoryFilter('income')}
              >
                <Text style={[styles.filterText, historyFilter === 'income' && styles.filterTextActive]}>
                  Доходы (+)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, historyFilter === 'expense' && styles.filterChipActive]}
                onPress={() => setHistoryFilter('expense')}
              >
                <Text style={[styles.filterText, historyFilter === 'expense' && styles.filterTextActive]}>
                  Траты (-)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, historyFilter === 'periods' && styles.filterChipActive]}
                onPress={() => setHistoryFilter('periods')}
              >
                <Text style={[styles.filterText, historyFilter === 'periods' && styles.filterTextActive]}>
                  Периоды ({periodSummaries.length})
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
              {historyFilter === 'periods' ? (
                periodSummaries.length === 0 ? (
                  <View style={styles.emptyBox}>
                    <Text style={styles.emptyText}>Итоги первого периода ещё формируются.</Text>
                    <Text style={styles.emptySubText}>
                      Утверди план и нажми «Завершить период» во вкладке «План»!
                    </Text>
                  </View>
                ) : (
                  periodSummaries.map((p, idx) => (
                    <View key={`period_${idx}`} style={styles.periodHistoryCard}>
                      <View style={styles.periodHistoryHeader}>
                        <Text style={styles.periodHistoryTitle}>Итоги периода {p.periodNumber}</Text>
                        <View style={[styles.disciplineBadge, p.disciplined ? styles.discOk : styles.discWarn]}>
                          <Text style={styles.disciplineBadgeText}>
                            {p.disciplined ? 'Дисциплина +' + p.bonusAwarded : 'Без бонуса'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.periodHistoryStats}>
                        Обязательные: факт {p.fact.mandatory} / план {p.plan.mandatory} • В цель: факт {p.fact.savings} / план {p.plan.savings}
                      </Text>
                    </View>
                  ))
                )
              ) : (
                (() => {
                  const filtered = transactions.filter((t) => {
                    if (historyFilter === 'income') return t.amount > 0;
                    if (historyFilter === 'expense') return t.amount < 0;
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <View style={styles.emptyBox}>
                        <Text style={styles.emptyText}>Операций пока нет.</Text>
                      </View>
                    );
                  }

                  return filtered.map((tx) => (
                    <View key={tx.id} style={styles.txRow}>
                      <View style={styles.txIconCircle}>
                        {tx.type === 'income' || tx.type === 'task_reward' || tx.type === 'parent_bonus' ? (
                          <IconSparkleStar size={16} />
                        ) : tx.type === 'savings_deposit' || tx.type === 'savings_withdraw' ? (
                          <IconTarget size={16} color="#7C3AED" />
                        ) : tx.type === 'mandatory' ? (
                          <IconApple size={16} />
                        ) : (
                          <IconPalette size={16} />
                        )}
                      </View>

                      <View style={styles.txInfoCol}>
                        <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                        <Text style={styles.txSub}>Период {tx.period} • {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                      </View>

                      <View style={[styles.txAmountBadge, tx.amount >= 0 ? styles.txAmountPositive : styles.txAmountNegative]}>
                        <Text style={[styles.txAmountText, tx.amount >= 0 ? styles.txPosText : styles.txNegText]}>
                          {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                        </Text>
                      </View>
                    </View>
                  ));
                })()
              )}
            </ScrollView>
          </View>
        )}
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
  modeTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 11,
    gap: 6,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modeTabTextActive: {
    color: '#92400E',
  },
  historyContainer: {
    maxHeight: 280,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  filterText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#92400E',
  },
  historyList: {
    maxHeight: 220,
  },
  emptyBox: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
  periodHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  periodHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  periodHistoryTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  disciplineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  discOk: {
    backgroundColor: '#DCFCE7',
  },
  discWarn: {
    backgroundColor: '#FEF3C7',
  },
  disciplineBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  periodHistoryStats: {
    fontSize: 11,
    color: '#64748B',
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 8,
  },
  txIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txInfoCol: {
    flex: 1,
  },
  txTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  txSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  txAmountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  txAmountPositive: {
    backgroundColor: '#DCFCE7',
  },
  txAmountNegative: {
    backgroundColor: '#FEE2E2',
  },
  txAmountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  txPosText: {
    color: '#15803D',
  },
  txNegText: {
    color: '#B91C1C',
  },
});
