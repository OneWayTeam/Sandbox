import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  IconArrowBack,
  IconCheck,
  IconPlus,
  IconMinus,
  IconApple,
  IconPalette,
  IconTarget,
  IconSparkleStar,
} from '../components/GameIcons';
import { BudgetPlan, BudgetFact, FinancialGoal } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';

const getCoinWord = (n: number) => {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs > 10 && abs < 20) return 'монет';
  if (last > 1 && last < 5) return 'монеты';
  if (last === 1) return 'монета';
  return 'монет';
};

interface PlanScreenProps {
  period: number;
  coins: number;
  budgetPlan: BudgetPlan;
  budgetFact: BudgetFact;
  activeGoal: FinancialGoal;
  petName?: string;
  onBackToRoom?: () => void;
  onPeriodAdvanced?: () => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({
  period,
  coins,
  budgetPlan,
  budgetFact,
  activeGoal,
  petName = 'Финни',
  onBackToRoom,
  onPeriodAdvanced,
}) => {
  // Available budget to plan for this period
  const totalAvailable = Math.max(
    coins,
    budgetPlan.isApproved ? (budgetPlan.mandatory + budgetPlan.discretionary + budgetPlan.savings) : 25
  );

  // Local state for allocation before approval
  const [mandatory, setMandatory] = useState(() => {
    if (budgetPlan.isApproved || budgetPlan.mandatory > 0) return budgetPlan.mandatory;
    return Math.floor(totalAvailable * 0.4);
  });
  const [discretionary, setDiscretionary] = useState(() => {
    if (budgetPlan.isApproved || budgetPlan.discretionary > 0) return budgetPlan.discretionary;
    return Math.floor(totalAvailable * 0.25);
  });
  const [savings, setSavings] = useState(() => {
    if (budgetPlan.isApproved || budgetPlan.savings > 0) return budgetPlan.savings;
    const m = Math.floor(totalAvailable * 0.4);
    const d = Math.floor(totalAvailable * 0.25);
    return totalAvailable - m - d;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAllocated = mandatory + discretionary + savings;
  const remainingBudget = totalAvailable - totalAllocated;
  const isFullyAllocated = remainingBudget === 0;

  const handleAdjust = (category: 'mand' | 'disc' | 'sav', delta: number) => {
    if (delta > 0) {
      if (remainingBudget <= 0) return;
      const actualDelta = Math.min(delta, remainingBudget);
      if (category === 'mand') setMandatory((prev) => prev + actualDelta);
      else if (category === 'disc') setDiscretionary((prev) => prev + actualDelta);
      else if (category === 'sav') setSavings((prev) => prev + actualDelta);
    } else {
      const absDelta = Math.abs(delta);
      if (category === 'mand') setMandatory((prev) => Math.max(0, prev - absDelta));
      else if (category === 'disc') setDiscretionary((prev) => Math.max(0, prev - absDelta));
      else if (category === 'sav') setSavings((prev) => Math.max(0, prev - absDelta));
    }
  };

  const handleDirectSet = (category: 'mand' | 'disc' | 'sav', valStr: string) => {
    const cleaned = valStr.replace(/[^0-9]/g, '');
    const num = cleaned === '' ? 0 : parseInt(cleaned, 10);
    const otherSum =
      category === 'mand'
        ? discretionary + savings
        : category === 'disc'
        ? mandatory + savings
        : mandatory + discretionary;
    const maxAllowed = Math.max(0, totalAvailable - otherSum);
    const clamped = Math.min(num, maxAllowed);
    if (category === 'mand') setMandatory(clamped);
    else if (category === 'disc') setDiscretionary(clamped);
    else if (category === 'sav') setSavings(clamped);
  };

  const handleAllocateRemaining = (category: 'mand' | 'disc' | 'sav') => {
    if (remainingBudget <= 0) return;
    handleAdjust(category, remainingBudget);
  };

  const handleApprove = () => {
    if (isSubmitting) return;
    if (remainingBudget > 0) {
      alert(
        `Нельзя оставлять деньги нераспределёнными! Осталось распределить: ${remainingBudget} монет. Добавь их в одну из статей.`
      );
      return;
    }
    if (remainingBudget < 0) {
      alert(`Сумма плана превышает доступный лимит на ${Math.abs(remainingBudget)} монет!`);
      return;
    }
    setIsSubmitting(true);
    gameStore.approveBudgetPlan(mandatory, discretionary, savings);
    setTimeout(() => setIsSubmitting(false), 400);
  };

  const handleAdvancePeriod = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    gameStore.advancePeriod();
    if (onPeriodAdvanced) onPeriodAdvanced();
    setTimeout(() => setIsSubmitting(false), 600);
  };

  return (
    <View style={styles.container}>
      {/* Top HUD */}
      <View style={styles.topHud}>
        {onBackToRoom && (
          <TouchableOpacity style={styles.backPill} onPress={onBackToRoom} activeOpacity={0.85}>
            <IconArrowBack size={16} color="#FFFFFF" />
            <Text style={styles.backPillText}>В комнату</Text>
          </TouchableOpacity>
        )}

        <View style={styles.titlePill}>
          <Text style={styles.sceneTitle}>Бюджет: Период {period}</Text>
        </View>

        <View style={styles.coinPill}>
          <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Budget Status Header (ТЗ 2.5.5) */}
        <View style={styles.budgetOverviewCard}>
          <View style={styles.overviewRow}>
            <View>
              <Text style={styles.overviewSub}>Доступный доход периода:</Text>
              <Text style={styles.overviewAmount}>{totalAvailable} {getCoinWord(totalAvailable)}</Text>
            </View>
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingLabel}>Не распределено:</Text>
              <Text
                style={[
                  styles.remainingVal,
                  remainingBudget === 0
                    ? styles.remainingZero
                    : remainingBudget > 0
                    ? styles.remainingWarning
                    : styles.remainingNegative,
                ]}
              >
                {remainingBudget === 0 ? '0 (всё готово! ✓)' : `${remainingBudget} ${getCoinWord(remainingBudget)}`}
              </Text>
            </View>
          </View>

          {/* Allocation Bar */}
          <View style={styles.multiBar}>
            <View
              style={[
                styles.barMandatory,
                { width: `${Math.min(100, (mandatory / totalAvailable) * 100)}%` },
              ]}
            />
            <View
              style={[
                styles.barDiscretionary,
                { width: `${Math.min(100, (discretionary / totalAvailable) * 100)}%` },
              ]}
            />
            <View
              style={[
                styles.barSavings,
                { width: `${Math.min(100, (savings / totalAvailable) * 100)}%` },
              ]}
            />
          </View>

          {/* Notice about unallocated coins */}
          {!budgetPlan.isApproved && remainingBudget > 0 && (
            <View style={styles.unallocatedNotice}>
              <Text style={styles.unallocatedNoticeText}>
                ⚠️ Осталось распределить: <Text style={{ fontWeight: '900' }}>{remainingBudget} {getCoinWord(remainingBudget)}</Text>. Нельзя оставлять монеты нераспределёнными — добавь их кнопками «+», «+Всё» или введи число!
              </Text>
            </View>
          )}
          {!budgetPlan.isApproved && remainingBudget === 0 && (
            <View style={styles.allocatedSuccessNotice}>
              <Text style={styles.allocatedSuccessNoticeText}>
                ✓ Доход полностью распределён (0 монет остатка). Теперь можно утвердить план!
              </Text>
            </View>
          )}
        </View>

        {/* 3 Categories Allocators (ТЗ 2.5.5: Обязательные, Необязательные, Накопления) */}
        <Text style={styles.sectionHeading}>
          {budgetPlan.isApproved ? 'Текущий план и факт трат' : 'Распределение монет по 3 статьям'}
        </Text>

        {/* 1. Mandatory Expenses */}
        <View style={styles.catCard}>
          <View style={[styles.catIconCircle, { backgroundColor: '#DCFCE7' }]}>
            <IconApple size={22} />
          </View>
          <View style={styles.catInfo}>
            <Text style={styles.catTitle}>1. Обязательные расходы</Text>
            <Text style={styles.catDesc}>Еда, здоровье и уход за {petName}</Text>
            {budgetPlan.isApproved && (
              <Text style={styles.factLine}>
                Факт трат: {budgetFact.mandatory} из {budgetPlan.mandatory} {getCoinWord(budgetPlan.mandatory)}
              </Text>
            )}
          </View>
          {!budgetPlan.isApproved ? (
            <View style={styles.allocatorCol}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, mandatory <= 0 && styles.stepBtnDisabled]}
                  onPress={() => handleAdjust('mand', -1)}
                  disabled={mandatory <= 0}
                  activeOpacity={0.7}
                >
                  <IconMinus size={14} color={mandatory <= 0 ? '#94A3B8' : '#334155'} />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepInput}
                  value={String(mandatory)}
                  keyboardType="numeric"
                  onChangeText={(val) => handleDirectSet('mand', val)}
                  maxLength={4}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.stepBtn, remainingBudget <= 0 && styles.stepBtnDisabled]}
                  onPress={() => handleAdjust('mand', 1)}
                  disabled={remainingBudget <= 0}
                  activeOpacity={0.7}
                >
                  <IconPlus size={14} color={remainingBudget <= 0 ? '#94A3B8' : '#334155'} />
                </TouchableOpacity>
              </View>

              {remainingBudget > 0 && (
                <View style={styles.quickStepRow}>
                  {remainingBudget >= 5 && (
                    <TouchableOpacity
                      style={styles.quickStepBtn}
                      onPress={() => handleAdjust('mand', 5)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickStepText}>+5</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.quickStepAllBtn}
                    onPress={() => handleAllocateRemaining('mand')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickStepAllText}>+Всё ({remainingBudget})</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.approvedPlanBadge}>
              <Text style={styles.approvedPlanText}>{budgetPlan.mandatory} {getCoinWord(budgetPlan.mandatory)}</Text>
            </View>
          )}
        </View>

        {/* 2. Discretionary Expenses */}
        <View style={styles.catCard}>
          <View style={[styles.catIconCircle, { backgroundColor: '#FEF3C7' }]}>
            <IconPalette size={22} />
          </View>
          <View style={styles.catInfo}>
            <Text style={styles.catTitle}>2. Траты на желаемое</Text>
            <Text style={styles.catDesc}>Краски, наклейки, уютные вещи</Text>
            {budgetPlan.isApproved && (
              <Text style={styles.factLine}>
                Факт трат: {budgetFact.discretionary} из {budgetPlan.discretionary} {getCoinWord(budgetPlan.discretionary)}
              </Text>
            )}
          </View>
          {!budgetPlan.isApproved ? (
            <View style={styles.allocatorCol}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, discretionary <= 0 && styles.stepBtnDisabled]}
                  onPress={() => handleAdjust('disc', -1)}
                  disabled={discretionary <= 0}
                  activeOpacity={0.7}
                >
                  <IconMinus size={14} color={discretionary <= 0 ? '#94A3B8' : '#334155'} />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepInput}
                  value={String(discretionary)}
                  keyboardType="numeric"
                  onChangeText={(val) => handleDirectSet('disc', val)}
                  maxLength={4}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.stepBtn, remainingBudget <= 0 && styles.stepBtnDisabled]}
                  onPress={() => handleAdjust('disc', 1)}
                  disabled={remainingBudget <= 0}
                  activeOpacity={0.7}
                >
                  <IconPlus size={14} color={remainingBudget <= 0 ? '#94A3B8' : '#334155'} />
                </TouchableOpacity>
              </View>

              {remainingBudget > 0 && (
                <View style={styles.quickStepRow}>
                  {remainingBudget >= 5 && (
                    <TouchableOpacity
                      style={styles.quickStepBtn}
                      onPress={() => handleAdjust('disc', 5)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickStepText}>+5</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.quickStepAllBtn}
                    onPress={() => handleAllocateRemaining('disc')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickStepAllText}>+Всё ({remainingBudget})</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.approvedPlanBadge}>
              <Text style={styles.approvedPlanText}>{budgetPlan.discretionary} {getCoinWord(budgetPlan.discretionary)}</Text>
            </View>
          )}
        </View>

        {/* 3. Savings */}
        <View style={styles.catCard}>
          <View style={[styles.catIconCircle, { backgroundColor: '#EDE9FE' }]}>
            <IconTarget size={22} color="#7C3AED" />
          </View>
          <View style={styles.catInfo}>
            <Text style={styles.catTitle}>3. Накопления в копилку</Text>
            <Text style={styles.catDesc}>Цель: «{activeGoal.title}»</Text>
            {budgetPlan.isApproved && (
              <Text style={styles.factLine}>
                Факт отложено: {budgetFact.savings} из {budgetPlan.savings} {getCoinWord(budgetPlan.savings)}
              </Text>
            )}
          </View>
          {!budgetPlan.isApproved ? (
            <View style={styles.allocatorCol}>
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={[styles.stepBtn, savings <= 0 && styles.stepBtnDisabled]}
                  onPress={() => handleAdjust('sav', -1)}
                  disabled={savings <= 0}
                  activeOpacity={0.7}
                >
                  <IconMinus size={14} color={savings <= 0 ? '#94A3B8' : '#334155'} />
                </TouchableOpacity>
                <TextInput
                  style={styles.stepInput}
                  value={String(savings)}
                  keyboardType="numeric"
                  onChangeText={(val) => handleDirectSet('sav', val)}
                  maxLength={4}
                  selectTextOnFocus
                />
                <TouchableOpacity
                  style={[styles.stepBtn, remainingBudget <= 0 && styles.stepBtnDisabled]}
                  onPress={() => handleAdjust('sav', 1)}
                  disabled={remainingBudget <= 0}
                  activeOpacity={0.7}
                >
                  <IconPlus size={14} color={remainingBudget <= 0 ? '#94A3B8' : '#334155'} />
                </TouchableOpacity>
              </View>

              {remainingBudget > 0 && (
                <View style={styles.quickStepRow}>
                  {remainingBudget >= 5 && (
                    <TouchableOpacity
                      style={styles.quickStepBtn}
                      onPress={() => handleAdjust('sav', 5)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.quickStepText}>+5</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.quickStepAllBtn}
                    onPress={() => handleAllocateRemaining('sav')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.quickStepAllText}>+Всё ({remainingBudget})</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.approvedPlanBadge}>
              <Text style={styles.approvedPlanText}>{budgetPlan.savings} {getCoinWord(budgetPlan.savings)}</Text>
            </View>
          )}
        </View>

        {/* Approval or Advance Period Action */}
        {!budgetPlan.isApproved ? (
          <View>
            <TouchableOpacity
              style={[
                styles.approveBtn,
                !isFullyAllocated && styles.approveBtnDisabled,
                isSubmitting && { opacity: 0.6 },
              ]}
              onPress={handleApprove}
              disabled={!isFullyAllocated || isSubmitting}
              activeOpacity={0.85}
            >
              <IconCheck size={18} color="#FFFFFF" />
              <Text style={styles.approveBtnText}>
                {isSubmitting
                  ? 'Сохранение плана...'
                  : remainingBudget > 0
                  ? `Осталось распределить: ${remainingBudget} ${getCoinWord(remainingBudget)}`
                  : remainingBudget < 0
                  ? `Превышение лимита на ${Math.abs(remainingBudget)}`
                  : '✓ Утвердить личный план бюджета'}
              </Text>
            </TouchableOpacity>

            {!isFullyAllocated && remainingBudget > 0 && (
              <Text style={styles.approveHintText}>
                ⚠️ По правилам планирования нельзя оставлять нераспределённые монеты
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.approvedActions}>
            <View style={styles.planSuccessBanner}>
              <IconCheck size={18} color="#15803D" />
              <Text style={styles.planSuccessText}>
                План периода {period} утверждён и действует!
              </Text>
            </View>

            {/* Advance Period (ТЗ 2.6: не менее 5 периодов в демонстрационном режиме) */}
            <TouchableOpacity
              style={[styles.advancePeriodBtn, isSubmitting && { opacity: 0.6 }]}
              onPress={handleAdvancePeriod}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <IconSparkleStar size={18} />
              <Text style={styles.advancePeriodBtnText}>
                {isSubmitting ? 'Подведение итогов...' : `Завершить период ${period} и подвести итоги →`}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF5EE',
    paddingTop: 16,
  },
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  budgetOverviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  overviewSub: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  overviewAmount: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  remainingBadge: {
    alignItems: 'flex-end',
  },
  remainingLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  remainingVal: {
    fontSize: 15,
    fontWeight: '800',
  },
  remainingPositive: {
    color: '#16A34A',
  },
  remainingZero: {
    color: '#16A34A',
  },
  remainingWarning: {
    color: '#D97706',
  },
  remainingNegative: {
    color: '#DC2626',
  },
  unallocatedNotice: {
    marginTop: 12,
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  unallocatedNoticeText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
    fontWeight: '500',
  },
  allocatedSuccessNotice: {
    marginTop: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  allocatedSuccessNoticeText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
    textAlign: 'center',
  },
  multiBar: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  barMandatory: {
    backgroundColor: '#16A34A',
    height: '100%',
  },
  barDiscretionary: {
    backgroundColor: '#F59E0B',
    height: '100%',
  },
  barSavings: {
    backgroundColor: '#8B5CF6',
    height: '100%',
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 12,
  },
  catIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catInfo: {
    flex: 1,
  },
  catTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  catDesc: {
    fontSize: 12,
    color: '#64748B',
  },
  factLine: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 4,
  },
  allocatorCol: {
    alignItems: 'flex-end',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepBtnDisabled: {
    opacity: 0.35,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stepInput: {
    width: 44,
    height: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    paddingVertical: 0,
    paddingHorizontal: 2,
  },
  quickStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  quickStepBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quickStepText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  quickStepAllBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  quickStepAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#2563EB',
  },
  stepVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    minWidth: 20,
    textAlign: 'center',
  },
  approvedPlanBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  approvedPlanText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#15803D',
  },
  approveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 14,
  },
  approveBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  approveHintText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
  approvedActions: {
    gap: 12,
    marginTop: 10,
  },
  planSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  planSuccessText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  advancePeriodBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  advancePeriodBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
