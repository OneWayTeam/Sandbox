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
import { FinancialGoal } from '../types/gameTypes';
import { IconArrowBack, IconSparkleStar } from './GameIcons';

interface WithdrawModalProps {
  visible: boolean;
  goal: FinancialGoal | null;
  onConfirmWithdraw: (amount: number) => void;
  onClose: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  visible,
  goal,
  onConfirmWithdraw,
  onClose,
}) => {
  if (!goal) return null;

  const withdrawAmount = 10;
  const currentSaved = goal.savedAmount;
  const newSaved = Math.max(0, currentSaved - withdrawAmount);

  // Time horizon calculation (assumes average deposit of 10 coins per period)
  const currentPeriodsLeft = Math.ceil(Math.max(0, goal.totalCost - currentSaved) / 10);
  const newPeriodsLeft = Math.ceil(Math.max(0, goal.totalCost - newSaved) / 10);

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Снятие из копилки цели</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.warningBadge}>
              <Text style={styles.warningTitle}>Внимание! Мечта отдалится</Text>
              <Text style={styles.warningText}>
                Ты собираешься снять {withdrawAmount} монет из цели «{goal.title}».
              </Text>
            </View>

            {/* Before vs After comparison (ТЗ 2.5.7) */}
            <View style={styles.comparisonBox}>
              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Было накоплено:</Text>
                <Text style={styles.compareValueCurrent}>
                  {currentSaved} из {goal.totalCost} монет
                </Text>
              </View>

              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Станет после снятия:</Text>
                <Text style={styles.compareValueNew}>
                  {newSaved} из {goal.totalCost} монет
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Оставалось периодов:</Text>
                <Text style={styles.compareValueCurrent}>~{currentPeriodsLeft} периодов</Text>
              </View>

              <View style={styles.compareRow}>
                <Text style={styles.compareLabel}>Новый срок накопления:</Text>
                <Text style={styles.compareValueAlert}>~{newPeriodsLeft} периодов (+1 период)</Text>
              </View>
            </View>

            <Text style={styles.pedagogicalNote}>
              Деньги вернутся в кошелёк, но срок покупки увеличится. Точно снять монеты?
            </Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelBtnText}>Оставить в копилке</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmWithdrawBtn}
                onPress={() => {
                  onConfirmWithdraw(withdrawAmount);
                  onClose();
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmWithdrawBtnText}>
                  Снять {withdrawAmount} монет
                </Text>
              </TouchableOpacity>
            </View>
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
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
  warningBadge: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 14,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 17,
  },
  comparisonBox: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    gap: 8,
  },
  compareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compareLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  compareValueCurrent: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  compareValueNew: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  compareValueAlert: {
    fontSize: 13,
    fontWeight: '800',
    color: '#DC2626',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 4,
  },
  pedagogicalNote: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    textAlign: 'center',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confirmWithdrawBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmWithdrawBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
