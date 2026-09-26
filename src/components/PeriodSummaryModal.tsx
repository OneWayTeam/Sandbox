import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import { PeriodSummary, PetStage } from '../types/gameTypes';
import { IconCheck, IconSparkleStar, IconTrophy } from './GameIcons';
import { PET_STAGES } from '../state/gameData';

interface PeriodSummaryModalProps {
  visible: boolean;
  summary: PeriodSummary | null;
  stage: PetStage;
  onClose: () => void;
}

export const PeriodSummaryModal: React.FC<PeriodSummaryModalProps> = ({
  visible,
  summary,
  stage,
  onClose,
}) => {
  if (!summary) return null;

  const currentStageInfo = PET_STAGES.find((s) => s.stage === stage) || PET_STAGES[0];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <IconSparkleStar size={24} />
            <Text style={styles.headerTitle}>
              Итоги игрового периода {summary.periodNumber}
            </Text>
            <IconSparkleStar size={24} />
          </View>

          <View style={styles.content}>
            {/* Discipline evaluation (ТЗ 2.5.10) */}
            <View
              style={[
                styles.disciplineCard,
                summary.disciplined ? styles.cardSuccess : styles.cardNormal,
              ]}
            >
              <Text
                style={[
                  styles.disciplineTitle,
                  summary.disciplined ? styles.textSuccess : styles.textNormal,
                ]}
              >
                {summary.disciplined
                  ? 'Отличная финансовая дисциплина!'
                  : 'Период завершён!'}
              </Text>
              <Text style={styles.disciplineDesc}>
                {summary.teachableMoment ||
                  (summary.disciplined
                    ? 'Ты обеспечил питомца всем необходимым и регулярно откладывал в копилку цели!'
                    : 'В следующем периоде постарайся заранее закрыть обязательные траты и пополнить цель.')}
              </Text>
            </View>

            {/* Plan vs Fact vs Variance table (ТЗ 2.5.5) */}
            <Text style={styles.tableHeading}>Сравнение плана, факта и отклонений:</Text>
            <View style={styles.tableBox}>
              <View style={styles.tableRowHeader}>
                <Text style={styles.thCol}>Статья</Text>
                <Text style={styles.thColCenter}>План</Text>
                <Text style={styles.thColCenter}>Факт</Text>
                <Text style={styles.thColRight}>Дельта</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tdColName}>Обязательные</Text>
                <Text style={styles.tdColCenter}>{summary.plan.mandatory}</Text>
                <Text
                  style={[
                    styles.tdColCenter,
                    summary.fact.mandatory >= summary.plan.mandatory
                      ? styles.colorGreen
                      : styles.colorOrange,
                  ]}
                >
                  {summary.fact.mandatory}
                </Text>
                <Text
                  style={[
                    styles.tdColRight,
                    summary.variance.mandatory >= 0 ? styles.colorGreen : styles.colorOrange,
                  ]}
                >
                  {summary.variance.mandatory > 0 ? `+${summary.variance.mandatory}` : summary.variance.mandatory}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tdColName}>Желания</Text>
                <Text style={styles.tdColCenter}>{summary.plan.discretionary}</Text>
                <Text style={styles.tdColCenter}>{summary.fact.discretionary}</Text>
                <Text style={styles.tdColRight}>
                  {summary.variance.discretionary > 0 ? `+${summary.variance.discretionary}` : summary.variance.discretionary}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={styles.tdColName}>В цель</Text>
                <Text style={styles.tdColCenter}>{summary.plan.savings}</Text>
                <Text
                  style={[
                    styles.tdColCenter,
                    summary.fact.savings >= summary.plan.savings
                      ? styles.colorGreen
                      : styles.colorOrange,
                  ]}
                >
                  {summary.fact.savings}
                </Text>
                <Text
                  style={[
                    styles.tdColRight,
                    summary.variance.savings >= 0 ? styles.colorGreen : styles.colorOrange,
                  ]}
                >
                  {summary.variance.savings > 0 ? `+${summary.variance.savings}` : summary.variance.savings}
                </Text>
              </View>
            </View>

            {/* Growth Stage Highlight (ТЗ 2.5.10 & 2.6: ≥3 стадии) */}
            <View style={styles.stageCard}>
              <View style={styles.stageIconBox}>
                <IconTrophy size={28} color="#D97706" />
              </View>
              <View style={styles.stageTextCol}>
                <Text style={styles.stageLabel}>Стадия развития Финни:</Text>
                <Text style={styles.stageName}>{currentStageInfo.title}</Text>
                <Text style={styles.stageSub}>{currentStageInfo.subtitle}</Text>
              </View>
            </View>

            {/* Income & Bonus for next period */}
            <View style={styles.rewardSummaryRow}>
              <Text style={styles.rewardSummaryLabel}>Начислено на новый период:</Text>
              <View style={styles.rewardBadge}>
                <Image
                  source={require('../../assets/coin.png')}
                  style={styles.rewardCoin}
                />
                <Text style={styles.rewardSumText}>+{20 + summary.bonusAwarded} монет</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <IconCheck size={20} color="#FFFFFF" />
              <Text style={styles.continueBtnText}>Перейти к новому периоду!</Text>
            </TouchableOpacity>
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
    maxWidth: 420,
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: '#FEF3C7',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#92400E',
  },
  content: {
    padding: 18,
  },
  disciplineCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  cardNormal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  disciplineTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  textSuccess: {
    color: '#15803D',
  },
  textNormal: {
    color: '#334155',
  },
  disciplineDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  tableHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  tableBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  thCol: {
    flex: 2,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  thColCenter: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  thColRight: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    alignItems: 'center',
  },
  tdColName: {
    flex: 2,
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  tdColCenter: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    textAlign: 'center',
  },
  tdColRight: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'right',
  },
  colorGreen: {
    color: '#16A34A',
  },
  colorOrange: {
    color: '#D97706',
  },
  stageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 12,
    marginBottom: 14,
  },
  stageIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stageTextCol: {
    flex: 1,
  },
  stageLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  stageName: {
    fontSize: 15,
    fontWeight: '900',
    color: '#78350F',
  },
  stageSub: {
    fontSize: 11,
    color: '#92400E',
  },
  rewardSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rewardSummaryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rewardCoin: {
    width: 22,
    height: 22,
  },
  rewardSumText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#15803D',
  },
  continueBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 14,
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
