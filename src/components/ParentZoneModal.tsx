import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  IconShieldCheck,
  IconRefresh,
  IconBook,
  IconCheck,
  IconArrowBack,
  IconSparkleStar,
} from './GameIcons';
import { gameStore } from '../state/gameStore';
import { FINANCIAL_TERMS, PET_STAGES } from '../state/gameData';
import { PetDevelopmentEngine } from '../pet/petDevelopmentEngine';

interface ParentZoneModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ParentZoneModal: React.FC<ParentZoneModalProps> = ({ visible, onClose }) => {
  // Security Barrier (Math Challenge for Adults)
  const [numA] = useState(7);
  const [numB] = useState(8);
  const [mathAnswer, setMathAnswer] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [barrierError, setBarrierError] = useState(false);

  // Tab inside parent zone
  const [activeTab, setActiveTab] = useState<'progress' | 'glossary' | 'demo'>('progress');

  const [gameState, setGameState] = useState(() => gameStore.getState());

  useEffect(() => {
    return gameStore.subscribe(() => {
      setGameState(gameStore.getState());
    });
  }, []);

  const currentStage = PET_STAGES.find((s) => s.stage === gameState.profile.stage) || PET_STAGES[0];
  const completedTasksCount = gameState.tasks.filter((t) => t.completed).length;
  const devEvaluation = PetDevelopmentEngine.evaluateStage(gameState as any);
  const animationsEnabled = (gameState as any).settings?.animationsEnabled ?? true;

  const handleToggleAnimations = () => {
    gameStore.toggleAnimations();
  };

  const handleUnlock = () => {
    if (parseInt(mathAnswer.trim(), 10) === numA * numB) {
      setIsUnlocked(true);
      setBarrierError(false);
    } else {
      setBarrierError(true);
    }
  };

  const [isProcessing, setIsProcessing] = useState(false);

  const handleResetDemoProfile = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await gameStore.resetTestProfile();
      alert('Тестовый профиль демо-режима успешно сброшен к исходному детерминированному состоянию.');
      onClose();
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const handleResetAllData = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await gameStore.resetAllLocalData();
      alert('Все локальные данные и снимки хранилища полностью очищены.');
      onClose();
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  const handleGrantParentBonus = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    gameStore.grantParentBonus(15, 'Поощрение от родителей за успехи');
    alert('Начислено +15 карманных монет за успехи и помощь по дому!');
    setTimeout(() => setIsProcessing(false), 500);
  };

  const handleClose = () => {
    setMathAnswer('');
    setIsUnlocked(false);
    setBarrierError(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <IconShieldCheck size={26} color={COLORS.primaryDark} />
              <Text style={styles.headerTitle}>Раздел для родителей и экспертов</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Barrier Protection (ТЗ 2.5.12) */}
          {!isUnlocked ? (
            <View style={styles.barrierBox}>
              <View style={styles.barrierIconCircle}>
                <IconShieldCheck size={40} color="#2563EB" />
              </View>
              <Text style={styles.barrierTitle}>Защитный барьер для взрослого</Text>
              <Text style={styles.barrierDesc}>
                Чтобы войти в раздел настроек, образовательного прогресса и сброса профиля,
                решите арифметический пример:
              </Text>

              <View style={styles.mathEquationBox}>
                <Text style={styles.mathEquationText}>
                  {numA} × {numB} = ?
                </Text>
              </View>

              <TextInput
                style={[styles.mathInput, barrierError && styles.mathInputError]}
                keyboardType="numeric"
                placeholder="Ваш ответ"
                placeholderTextColor="#94A3B8"
                value={mathAnswer}
                onChangeText={(t) => {
                  setMathAnswer(t);
                  setBarrierError(false);
                }}
              />

              {barrierError && (
                <Text style={styles.errorText}>Неверный ответ. Пожалуйста, попробуйте снова.</Text>
              )}

              <TouchableOpacity style={styles.unlockBtn} onPress={handleUnlock} activeOpacity={0.85}>
                <Text style={styles.unlockBtnText}>Подтвердить и войти</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Unlocked Content
            <View style={styles.unlockedContainer}>
              {/* Tab Navigation */}
              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'progress' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('progress')}
                >
                  <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>
                    Прогресс
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'glossary' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('glossary')}
                >
                  <Text style={[styles.tabText, activeTab === 'glossary' && styles.tabTextActive]}>
                    Справочник
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'demo' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('demo')}
                >
                  <Text style={[styles.tabText, activeTab === 'demo' && styles.tabTextActive]}>
                    Экспертная проверка
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
                {/* 1. PROGRESS TAB */}
                {activeTab === 'progress' && (
                  <View style={styles.tabContent}>
                    <View style={styles.goalMissionCard}>
                      <Text style={styles.missionTitle}>Образовательная цель сервиса</Text>
                      <Text style={styles.missionText}>
                        Формирование финансовой культуры у детей 7–11 лет в соответствии с Единой
                        рамкой компетенций (раздел 6): различие обязательных и желаемых расходов,
                        планирование бюджета и целевые накопления без риска и без реальных платежей.
                      </Text>
                    </View>

                    <Text style={styles.sectionHeading}>Текущие показатели ребенка</Text>
                    <View style={styles.statsGrid}>
                      <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Игрок и питомец</Text>
                        <Text style={styles.statValue}>
                          {gameState.profile.playerName} / {gameState.profile.petName}
                        </Text>
                        <Text style={styles.statSub}>Стадия: {currentStage.title}</Text>
                      </View>

                      <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Игровой период</Text>
                        <Text style={styles.statValue}>Период {gameState.period}</Text>
                        <Text style={styles.statSub}>Сбережения: {gameState.savings} монет</Text>
                      </View>

                      <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Решено заданий</Text>
                        <Text style={styles.statValue}>
                          {completedTasksCount} из {gameState.tasks.length}
                        </Text>
                        <Text style={styles.statSub}>3 финансовые темы</Text>
                      </View>

                      <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Дисциплина бюджета</Text>
                        <Text style={styles.statValue}>
                          {gameState.budgetPlan.isApproved ? 'План утверждён' : 'Ожидает плана'}
                        </Text>
                        <Text style={styles.statSub}>Факт: {gameState.budgetFact.mandatory} обяз. / {gameState.budgetFact.savings} накопл.</Text>
                      </View>
                    </View>

                    {/* Parent Reward Mechanics (ТЗ 2.5.12) */}
                    <View style={styles.parentRewardBox}>
                      <Text style={styles.parentRewardTitle}>Родительская мотивация</Text>
                      <Text style={styles.parentRewardDesc}>
                        Начислите бонусные игровые монеты за реальные полезные привычки: помощь по
                        дому, чтение книги или соблюдение договорённостей.
                      </Text>
                      <TouchableOpacity
                        style={styles.grantBonusBtn}
                        onPress={handleGrantParentBonus}
                        activeOpacity={0.85}
                      >
                        <IconSparkleStar size={18} />
                        <Text style={styles.grantBonusBtnText}>
                          Поощрить ребёнка (+15 карманных монет)
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Pet Progression Metrics Checklist */}
                    <View style={styles.progressionCard}>
                      <Text style={styles.progressionTitle}>
                        Развитие питомца: {devEvaluation.stageTitle}
                      </Text>
                      <Text style={styles.progressionSubtitle}>
                        {devEvaluation.stageSubtitle}
                      </Text>

                      {devEvaluation.nextStageInfo && (
                        <View style={styles.nextStageSection}>
                          <Text style={styles.nextStageHeading}>
                            Критерии перехода к «{devEvaluation.nextStageInfo.targetTitle}»:
                          </Text>
                          {devEvaluation.nextStageInfo.checklist.map((item) => (
                            <View key={item.key} style={styles.criteriaRow}>
                              <Text style={item.met ? styles.criteriaIconMet : styles.criteriaIconUnmet}>
                                {item.met ? '✓' : '○'}
                              </Text>
                              <Text style={styles.criteriaTitle}>{item.title}:</Text>
                              <Text style={[styles.criteriaValue, item.met && styles.criteriaValueMet]}>
                                {item.current} / {item.required} {item.unit}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* 2. GLOSSARY TAB */}
                {activeTab === 'glossary' && (
                  <View style={styles.tabContent}>
                    <Text style={styles.sectionHeading}>Справочник ключевых понятий (ТЗ 2.5.11)</Text>
                    {FINANCIAL_TERMS.map((item, idx) => (
                      <View key={`term_${idx}`} style={styles.termCard}>
                        <View style={styles.termHeaderRow}>
                          <IconBook size={20} color={COLORS.primaryDark} />
                          <Text style={styles.termTitle}>{item.term}</Text>
                        </View>
                        <Text style={styles.termChild}>«{item.childDesc}»</Text>
                        <View style={styles.termParentBadge}>
                          <Text style={styles.termParentText}>Для взрослого: {item.parentNote}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* 3. DEMO & EXPERT REVIEW TAB */}
                {activeTab === 'demo' && (
                  <View style={styles.tabContent}>
                    <View style={styles.demoBanner}>
                      <Text style={styles.demoBannerTitle}>Демонстрационный режим (ТЗ 2.5.13)</Text>
                      <Text style={styles.demoBannerText}>
                        Позволяет экспертной комиссии хакатона пройти сквозной сценарий подряд:
                        сменить периоды, протестировать логику списаний, проверить реакцию при
                        нехватке средств и оценить стадии роста питомца.
                      </Text>
                    </View>

                    <Text style={styles.sectionHeading}>Настройки графики и анимаций</Text>
                    <TouchableOpacity
                      style={[
                        styles.animToggleBtn,
                        animationsEnabled ? styles.animToggleBtnActive : styles.animToggleBtnInactive,
                      ]}
                      onPress={handleToggleAnimations}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.animToggleBtnText}>
                        {animationsEnabled
                          ? 'Анимации питомца: ВКЛЮЧЕНЫ'
                          : 'Анимации питомца: ВЫКЛЮЧЕНЫ (Статика)'}
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.sectionHeading}>Управление экспертным профилем</Text>

                    <TouchableOpacity
                      style={styles.resetBtn}
                      onPress={handleResetDemoProfile}
                      activeOpacity={0.85}
                    >
                      <IconRefresh size={20} color="#FFFFFF" />
                      <Text style={styles.resetBtnText}>Сбросить демо-профиль к началу</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.resetBtn, { backgroundColor: '#7F1D1D', marginTop: -10 }]}
                      onPress={handleResetAllData}
                      activeOpacity={0.85}
                    >
                      <IconRefresh size={20} color="#FFFFFF" />
                      <Text style={styles.resetBtnText}>Сбросить все локальные данные (Wipe)</Text>
                    </TouchableOpacity>

                    <View style={styles.demoInfoList}>
                      <Text style={styles.demoInfoItem}>
                        • Обязательные функциональные требования: разделы 2.5.1–2.5.14 полностью соблюдены.
                      </Text>
                      <Text style={styles.demoInfoItem}>
                        • Минимальный объем демо-контента (раздел 2.6):
                      </Text>
                      <Text style={styles.demoSubItem}>— Питомец: 27 комбинаций кастомизации (минимум 9)</Text>
                      <Text style={styles.demoSubItem}>— Игровые периоды: 5 последовательных циклов</Text>
                      <Text style={styles.demoSubItem}>— Финансовые задания: 6 сценариев по 3 темам</Text>
                      <Text style={styles.demoSubItem}>— Каталог покупок: 10 позиций (обязательные и желаемые)</Text>
                      <Text style={styles.demoSubItem}>— Цели накопления: 3 цели с расчетом срока</Text>
                      <Text style={styles.demoSubItem}>— Рост питомца: 3 стадии развития</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </View>
          )}
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
  modalCard: {
    width: '100%',
    maxWidth: 430,
    maxHeight: '92%',
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
    paddingVertical: 16,
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
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
  barrierBox: {
    padding: 24,
    alignItems: 'center',
  },
  barrierIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  barrierTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  barrierDesc: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  mathEquationBox: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  mathEquationText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E293B',
    letterSpacing: 1,
  },
  mathInput: {
    width: '100%',
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  mathInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    marginBottom: 12,
    fontWeight: '600',
  },
  unlockBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  unlockBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unlockedContainer: {
    flex: 1,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 6,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0F172A',
    fontWeight: '700',
  },
  scrollArea: {
    padding: 16,
  },
  tabContent: {
    paddingBottom: 24,
  },
  goalMissionCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 16,
  },
  missionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 6,
  },
  missionText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 19,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  statSub: {
    fontSize: 11,
    color: '#22C55E',
    fontWeight: '600',
  },
  parentRewardBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  parentRewardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 6,
  },
  parentRewardDesc: {
    fontSize: 12,
    color: '#92400E',
    lineHeight: 18,
    marginBottom: 12,
  },
  grantBonusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 12,
  },
  grantBonusBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressionCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: 14,
    marginBottom: 10,
  },
  progressionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#166534',
    marginBottom: 4,
  },
  progressionSubtitle: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 18,
    marginBottom: 10,
  },
  nextStageSection: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    gap: 8,
  },
  nextStageHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criteriaIconMet: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16A34A',
    width: 16,
    textAlign: 'center',
  },
  criteriaIconUnmet: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94A3B8',
    width: 16,
    textAlign: 'center',
  },
  criteriaTitle: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
  criteriaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  criteriaValueMet: {
    color: '#16A34A',
  },
  animToggleBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  animToggleBtnActive: {
    backgroundColor: '#3B82F6',
  },
  animToggleBtnInactive: {
    backgroundColor: '#64748B',
  },
  animToggleBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  termCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  termHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  termTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  termChild: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 6,
    fontStyle: 'italic',
  },
  termParentBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  termParentText: {
    fontSize: 11,
    color: '#0369A1',
    fontWeight: '600',
  },
  demoBanner: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 16,
  },
  demoBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 4,
  },
  demoBannerText: {
    fontSize: 12,
    color: '#166534',
    lineHeight: 18,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 20,
  },
  resetBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  demoInfoList: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  demoInfoItem: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  demoSubItem: {
    fontSize: 12,
    color: '#64748B',
    paddingLeft: 8,
  },
});
