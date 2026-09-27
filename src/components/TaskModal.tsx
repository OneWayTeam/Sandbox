import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { COLORS } from '../theme/colors';
import {
  IconCheck,
  IconSparkleStar,
  IconArrowBack,
  IconApple,
  IconTarget,
  IconPalette,
  IconLightbulb,
} from './GameIcons';
import { FinancialTask, TaskOption } from '../types/gameTypes';
import { gameStore } from '../state/gameStore';

interface TaskModalProps {
  visible: boolean;
  task: FinancialTask | null;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ visible, task, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<TaskOption | null>(null);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    explanation: string;
    reward: number;
  } | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);

  if (!task) return null;

  const handleSelectOption = (option: TaskOption) => {
    if (isSelecting || selectedOption || feedback) return;
    setIsSelecting(true);
    setSelectedOption(option);
    const res = gameStore.completeTask(task.id, option.id);
    setFeedback(res);
    setIsSelecting(false);
  };

  const handleFinish = () => {
    setSelectedOption(null);
    setFeedback(null);
    onClose();
  };

  // Theme badge icon
  const renderThemeIcon = () => {
    if (task.theme === 'budget') return <IconPalette size={20} />;
    if (task.theme === 'savings') return <IconTarget size={20} color="#7C3AED" />;
    return <IconApple size={20} />;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleFinish}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.themeTag}>
              {renderThemeIcon()}
              <Text style={styles.themeTagText}>{task.themeTitle}</Text>
            </View>
            <TouchableOpacity onPress={handleFinish} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Title & Scenario */}
            <View style={styles.titleRow}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              {(task as any).difficulty && (
                <View
                  style={[
                    styles.difficultyTag,
                    (task as any).difficulty === 'easy'
                      ? styles.diffEasy
                      : (task as any).difficulty === 'medium'
                      ? styles.diffMed
                      : styles.diffHard,
                  ]}
                >
                  <IconSparkleStar size={13} color="#D97706" />
                  <Text style={styles.difficultyText}>
                    {(task as any).difficulty === 'easy'
                      ? 'Начальный уровень'
                      : (task as any).difficulty === 'medium'
                      ? 'Средний уровень'
                      : 'Уровень Мастер'}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.scenarioCard}>
              <Text style={styles.scenarioText}>{task.situation || task.scenario}</Text>

              {/* Available Resources badge */}
              {(task as any).availableResources && (
                <View style={styles.resourcesBox}>
                  <Text style={styles.resourcesLabel}>Доступные ресурсы:</Text>
                  <Text style={styles.resourcesText}>{(task as any).availableResources}</Text>
                </View>
              )}
            </View>

            {/* Options or Feedback */}
            {!feedback ? (
              <View style={styles.optionsContainer}>
                <Text style={styles.promptText}>Как ты посоветуешь поступить Финни?</Text>
                {task.options.map((option, idx) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[styles.optionBtn, isSelecting && { opacity: 0.6 }]}
                    onPress={() => handleSelectOption(option)}
                    disabled={isSelecting || !!selectedOption || !!feedback}
                    activeOpacity={0.85}
                  >
                    <View style={styles.optionBadge}>
                      <Text style={styles.optionLetter}>
                        {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{option.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // EDUCATIONAL FEEDBACK & CONSEQUENCE (ТЗ 2.5.8 & 2.5.9)
              <View style={styles.feedbackContainer}>
                <View
                  style={[
                    styles.resultCard,
                    feedback.isCorrect ? styles.resultCardSuccess : styles.resultCardWarning,
                  ]}
                >
                  <View style={styles.resultHeader}>
                    {feedback.isCorrect ? (
                      <View style={styles.successIconCircle}>
                        <IconCheck size={20} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.warningIconCircle}>
                        <IconLightbulb size={18} color="#B45309" />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.resultTitle,
                        feedback.isCorrect ? styles.resultTitleSuccess : styles.resultTitleWarning,
                      ]}
                    >
                      {feedback.isCorrect ? 'Мудрое решение!' : 'Полезный урок!'}
                    </Text>
                  </View>

                  <Text style={styles.explanationText}>{feedback.explanation}</Text>

                  {/* Outcome changes */}
                  <View style={styles.outcomeRow}>
                    <View style={styles.outcomeBadge}>
                      <Image
                        source={require('../../assets/coin.png')}
                        style={styles.outcomeCoin}
                      />
                      <Text style={styles.outcomeText}>+{feedback.reward} монет</Text>
                    </View>

                    <View style={styles.outcomeBadge}>
                      <IconSparkleStar size={16} />
                      <Text style={styles.outcomeText}>
                        {feedback.isCorrect ? '+Опыт и радость' : '+Опыт на будущее'}
                      </Text>
                    </View>
                  </View>

                  {/* Next Step Recommendation */}
                  {(selectedOption as any)?.consequence?.nextStepRecommendation ? (
                    <View style={styles.nextStepBox}>
                      <Text style={styles.nextStepTitle}>Следующий шаг:</Text>
                      <Text style={styles.nextStepText}>
                        {(selectedOption as any).consequence.nextStepRecommendation}
                      </Text>
                    </View>
                  ) : !feedback.isCorrect ? (
                    <View style={styles.recoveryTipBox}>
                      <Text style={styles.recoveryTipTitle}>Как исправить ситуацию:</Text>
                      <Text style={styles.recoveryTipText}>
                        Ошибки в игре безопасны! Ты можешь скорректировать бюджет на следующий период,
                        выполнить другое задание в парке или временно отложить необязательные покупки.
                      </Text>
                    </View>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={handleFinish}
                  activeOpacity={0.85}
                >
                  <Text style={styles.continueBtnText}>Понятно, продолжить!</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
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
    maxHeight: '90%',
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
  themeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  themeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
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
  scrollArea: {
    padding: 20,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  scenarioCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  scenarioText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
  },
  promptText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 12,
    paddingBottom: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    minHeight: 56, // Meets ≥48x48dp kid accessibility guideline
  },
  optionBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: '800',
    color: '#334155',
  },
  optionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    lineHeight: 18,
  },
  feedbackContainer: {
    paddingBottom: 16,
  },
  resultCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  resultCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  resultCardWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  successIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningSign: {
    fontSize: 16,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  resultTitleSuccess: {
    color: '#15803D',
  },
  resultTitleWarning: {
    color: '#B45309',
  },
  explanationText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  outcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  outcomeCoin: {
    width: 18,
    height: 18,
  },
  outcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  recoveryTipBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  recoveryTipTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  recoveryTipText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
  nextStepBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 8,
  },
  nextStepTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    marginBottom: 4,
  },
  nextStepText: {
    fontSize: 12,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  difficultyTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  diffEasy: {
    backgroundColor: '#DCFCE7',
  },
  diffMed: {
    backgroundColor: '#FEF3C7',
  },
  diffHard: {
    backgroundColor: '#FEE2E2',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  resourcesBox: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resourcesLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  resourcesText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  continueBtn: {
    backgroundColor: COLORS.primaryDark,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  continueBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
