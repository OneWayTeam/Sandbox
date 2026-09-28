import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
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
  const [withdrawInput, setWithdrawInput] = useState<string>('5');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    if (goal) {
      const initAmt = Math.min(10, Math.max(1, goal.savedAmount));
      setWithdrawInput(String(initAmt));
    }
  }, [goal?.id, visible]);

  if (!goal) return null;

  const isCompleted = goal.savedAmount >= goal.totalCost || Boolean(goal.completed);
  const maxWithdraw = goal.savedAmount;
  const parsedAmt = parseInt(withdrawInput, 10);
  const withdrawAmount = isNaN(parsedAmt)
    ? 1
    : Math.min(maxWithdraw, Math.max(1, parsedAmt));

  const currentSaved = goal.savedAmount;
  const newSaved = Math.max(0, currentSaved - withdrawAmount);

  const handleConfirmPress = () => {
    if (isWithdrawing || isCompleted || withdrawAmount <= 0) return;
    setIsWithdrawing(true);
    onConfirmWithdraw(withdrawAmount);
    onClose();
    setTimeout(() => setIsWithdrawing(false), 400);
  };

  const handleStep = (delta: number) => {
    const next = Math.min(maxWithdraw, Math.max(1, withdrawAmount + delta));
    setWithdrawInput(String(next));
  };

  // Time horizon calculation (assumes average deposit of 10 coins per period)
  const currentPeriodsLeft = Math.ceil(Math.max(0, goal.totalCost - currentSaved) / 10);
  const newPeriodsLeft = Math.ceil(Math.max(0, goal.totalCost - newSaved) / 10);
  const delay = Math.max(0, newPeriodsLeft - currentPeriodsLeft);

  const chipOptions = Array.from(new Set([1, 5, 10, maxWithdraw])).filter(
    (n) => n > 0 && n <= maxWithdraw
  );

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
            {isCompleted ? (
              <View>
                <View style={styles.completedAlert}>
                  <Text style={styles.completedAlertTitle}>🏆 Цель уже выполнена!</Text>
                  <Text style={styles.completedAlertText}>
                    Цель «{goal.title}» полностью собрана ({goal.savedAmount} из {goal.totalCost} монет). Монеты зафиксированы для покупки мечты и не могут быть сняты.
                  </Text>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.85}>
                  <Text style={styles.cancelBtnText}>Понятно</Text>
                </TouchableOpacity>
              </View>
            ) : maxWithdraw <= 0 ? (
              <View>
                <View style={styles.warningBadge}>
                  <Text style={styles.warningTitle}>Копилка пуста</Text>
                  <Text style={styles.warningText}>
                    В цели «{goal.title}» пока нет накопленных монет для снятия.
                  </Text>
                </View>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.85}>
                  <Text style={styles.cancelBtnText}>Закрыть</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.warningBadge}>
                  <Text style={styles.warningTitle}>Внимание! Мечта отдалится</Text>
                  <Text style={styles.warningText}>
                    Ты собираешься снять {withdrawAmount} монет из цели «{goal.title}».
                  </Text>
                </View>

                {/* Amount Selector */}
                <View style={styles.selectorContainer}>
                  <Text style={styles.selectorLabel}>Сколько монет снять (доступно {maxWithdraw}):</Text>

                  {/* Stepper with TextInput */}
                  <View style={styles.stepperRow}>
                    <TouchableOpacity
                      style={[styles.stepBtn, withdrawAmount <= 1 && styles.stepBtnDisabled]}
                      onPress={() => handleStep(-1)}
                      disabled={withdrawAmount <= 1}
                    >
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>

                    <View style={styles.inputWrapper}>
                      <TextInput
                        style={styles.numberInput}
                        keyboardType="number-pad"
                        value={withdrawInput}
                        onChangeText={(t) => setWithdrawInput(t.replace(/[^0-9]/g, ''))}
                        maxLength={5}
                      />
                      <Image
                        source={require('../../assets/coin.png')}
                        style={styles.coinIconInput}
                      />
                    </View>

                    <TouchableOpacity
                      style={[styles.stepBtn, withdrawAmount >= maxWithdraw && styles.stepBtnDisabled]}
                      onPress={() => handleStep(1)}
                      disabled={withdrawAmount >= maxWithdraw}
                    >
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Quick Preset Chips */}
                  <View style={styles.presetChipsRow}>
                    {chipOptions.map((opt) => (
                      <TouchableOpacity
                        key={`chip_${opt}`}
                        style={[
                          styles.presetChip,
                          withdrawAmount === opt && styles.presetChipActive,
                        ]}
                        onPress={() => setWithdrawInput(String(opt))}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            withdrawAmount === opt && styles.presetChipTextActive,
                          ]}
                        >
                          {opt === maxWithdraw ? `Всё (${opt})` : `${opt}`}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Before vs After comparison */}
                <View style={styles.comparisonBox}>
                  <View style={styles.compareRow}>
                    <Text style={styles.compareLabel}>Было в копилке:</Text>
                    <Text style={styles.compareValueCurrent}>
                      {currentSaved} из {goal.totalCost} монет
                    </Text>
                  </View>

                  <View style={styles.compareRow}>
                    <Text style={styles.compareLabel}>Останется после снятия:</Text>
                    <Text style={styles.compareValueNew}>
                      {newSaved} из {goal.totalCost} монет
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.compareRow}>
                    <Text style={styles.compareLabel}>Задержка мечты:</Text>
                    <Text style={styles.compareValueAlert}>
                      +{delay} {delay === 1 ? 'период' : delay < 5 ? 'периода' : 'периодов'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.pedagogicalNote}>
                  Монеты вернутся в кошелёк, но цель отдалится. Точно подтвердить?
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
                    style={[styles.confirmWithdrawBtn, isWithdrawing && { opacity: 0.6 }]}
                    onPress={handleConfirmPress}
                    disabled={isWithdrawing}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.confirmWithdrawBtnText}>
                      {isWithdrawing ? 'Снятие...' : `Снять ${withdrawAmount} 🪙`}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
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
  selectorContainer: {
    backgroundColor: '#F1F5F9',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepBtnText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
    lineHeight: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    minWidth: 110,
    height: 44,
    justifyContent: 'center',
  },
  numberInput: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    padding: 0,
    minWidth: 40,
  },
  coinIconInput: {
    width: 20,
    height: 20,
    marginLeft: 6,
  },
  presetChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  presetChipTextActive: {
    color: '#92400E',
  },
  completedAlert: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#A7F3D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  completedAlertTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#065F46',
    marginBottom: 6,
  },
  completedAlertText: {
    fontSize: 13,
    color: '#047857',
    lineHeight: 18,
  },
});
