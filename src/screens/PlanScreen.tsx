import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
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

interface PlanScreenProps {
  period: number;
  coins: number;
  budgetPlan: BudgetPlan;
  budgetFact: BudgetFact;
  activeGoal: FinancialGoal;
  onBackToRoom?: () => void;
  onPeriodAdvanced?: () => void;
}

export const PlanScreen: React.FC<PlanScreenProps> = ({
  period,
  coins,
  budgetPlan,
  budgetFact,
  activeGoal,
  onBackToRoom,
  onPeriodAdvanced,
}) => {
  // Available budget to plan for this period
  const totalAvailable = Math.max(coins, budgetPlan.isApproved ? (budgetPlan.mandatory + budgetPlan.discretionary + budgetPlan.savings) : 25);

  // Local state for allocation before approval
  const [mandatory, setMandatory] = useState(budgetPlan.mandatory ?? 10);
  const [discretionary, setDiscretionary] = useState(budgetPlan.discretionary ?? 5);
  const [savings, setSavings] = useState(budgetPlan.savings ?? 10);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAllocated = mandatory + discretionary + savings;
  const remainingBudget = totalAvailable - totalAllocated;

  const handleAdjust = (category: 'mand' | 'disc' | 'sav', delta: number) => {
    if (delta > 0 && remainingBudget < delta) {
      alert('Недостаточно свободного бюджета для распределения!');
      return;
    }

    if (category === 'mand') {
      setMandatory((prev) => Math.max(0, prev + delta));
    } else if (category === 'disc') {
      setDiscretionary((prev) => Math.max(0, prev + delta));
    } else if (category === 'sav') {
      setSavings((prev) => Math.max(0, prev + delta));
    }
  };

  const handleApprove = () => {
    if (isSubmitting) return;
    if (totalAllocated > totalAvailable) {
      alert('Сумма плана не может превышать доступный бюджет!');
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
              <Text style={styles.overviewAmount}>{totalAvailable} монет</Text>
            </View>
            <View style={styles.remainingBadge}>
              <Text style={styles.remainingLabel}>Не распределено:</Text>
              <Text
                style={[
                  styles.remainingVal,
                  remainingBudget < 0 ? styles.remainingNegative : styles.remainingPositive,
                ]}
              >
                {remainingBudget} монет
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
            <Text style={styles.catDesc}>Еда, здоровье и уход за Финни</Text>
            {budgetPlan.isApproved && (
              <Text style={styles.factLine}>
                Факт трат: {budgetFact.mandatory} из {budgetPlan.mandatory} монет
              </Text>
            )}
          </View>
          {!budgetPlan.isApproved ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjust('mand', -5)}
              >
                <IconMinus size={14} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{mandatory}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjust('mand', 5)}
              >
                <IconPlus size={14} color="#334155" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.approvedPlanBadge}>
              <Text style={styles.approvedPlanText}>{budgetPlan.mandatory} монет</Text>
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
                Факт трат: {budgetFact.discretionary} из {budgetPlan.discretionary} монет
              </Text>
            )}
          </View>
          {!budgetPlan.isApproved ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjust('disc', -5)}
              >
                <IconMinus size={14} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{discretionary}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjust('disc', 5)}
              >
                <IconPlus size={14} color="#334155" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.approvedPlanBadge}>
              <Text style={styles.approvedPlanText}>{budgetPlan.discretionary} монет</Text>
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
                Факт отложено: {budgetFact.savings} из {budgetPlan.savings} монет
              </Text>
            )}
          </View>
          {!budgetPlan.isApproved ? (
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjust('sav', -5)}
              >
                <IconMinus size={14} color="#334155" />
              </TouchableOpacity>
              <Text style={styles.stepVal}>{savings}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleAdjust('sav', 5)}
              >
                <IconPlus size={14} color="#334155" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.approvedPlanBadge}>
              <Text style={styles.approvedPlanText}>{budgetPlan.savings} монет</Text>
            </View>
          )}
        </View>

        {/* Approval or Advance Period Action */}
        {!budgetPlan.isApproved ? (
          <TouchableOpacity
            style={[styles.approveBtn, isSubmitting && { opacity: 0.6 }]}
            onPress={handleApprove}
            disabled={isSubmitting}
            activeOpacity={0.85}
          >
            <IconCheck size={18} color="#FFFFFF" />
            <Text style={styles.approveBtnText}>
              {isSubmitting ? 'Сохранение плана...' : 'Утвердить личный план бюджета'}
            </Text>
          </TouchableOpacity>
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
  remainingNegative: {
    color: '#DC2626',
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
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 4,
    gap: 8,
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
  approveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
