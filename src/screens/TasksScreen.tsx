import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { FinnyCharacter } from '../components/FinnyCharacter';
import { COLORS } from '../theme/colors';
import {
  IconArrowBack,
  IconCheck,
  IconSparkleStar,
  IconPalette,
  IconTarget,
  IconApple,
  IconTrophy,
  IconMedal,
} from '../components/GameIcons';
import { FinancialTask, TaskTheme, GameAchievement } from '../types/gameTypes';
import { TaskModal } from '../components/TaskModal';
import { gameStore } from '../state/gameStore';
import { replacePetName } from '../utils/textUtils';

interface TasksScreenProps {
  coins: number;
  tasks: FinancialTask[];
  subCategory?: string;
  petName?: string;
  onBackToRoom: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TasksScreen: React.FC<TasksScreenProps> = ({
  coins,
  tasks,
  subCategory = 'all',
  petName = 'Финни',
  onBackToRoom,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'all' | TaskTheme | 'trophies'>('all');
  const [activeTask, setActiveTask] = useState<FinancialTask | null>(null);

  React.useEffect(() => {
    if (subCategory === 'trophies') {
      setSelectedTheme('trophies');
    } else if (subCategory === 'budget') {
      setSelectedTheme('budget');
    } else if (subCategory === 'savings') {
      setSelectedTheme('savings');
    } else if (subCategory === 'payments') {
      setSelectedTheme('payments');
    } else if (subCategory === 'quests' || subCategory === 'all') {
      setSelectedTheme('all');
    }
  }, [subCategory]);

  const state = gameStore.getState();
  const activeGoal = state.goals.find((g) => g.id === state.activeGoalId) || state.goals[0];

  const achievements: GameAchievement[] = [
    {
      id: 'ach_budget',
      title: 'Первый личный бюджет',
      description: 'Утверди план распределения монет на текущий период',
      iconName: 'palette',
      unlocked: state.budgetPlan.isApproved,
      rewardCoins: 5,
    },
    {
      id: 'ach_save',
      title: 'Бережливый компаньон',
      description: 'Отложи первые монеты в золотой сейф мечты',
      iconName: 'target',
      unlocked: state.savings > 0 || (activeGoal && activeGoal.savedAmount > 0),
      rewardCoins: 5,
    },
    {
      id: 'ach_care',
      title: 'Заботливый друг',
      description: 'Купи обязательную здоровую еду или щётку для питомца',
      iconName: 'apple',
      unlocked: state.budgetFact.mandatory > 0,
      rewardCoins: 5,
    },
    {
      id: 'ach_tasks',
      title: 'Финансовый эрудит',
      description: 'Реши не менее 3 обучающих ситуаций в парке заданий',
      iconName: 'star',
      unlocked: tasks.filter((t) => t.completed).length >= 3,
      rewardCoins: 10,
    },
    {
      id: 'ach_half_goal',
      title: 'На полпути к мечте',
      description: 'Накопи 50% и более от стоимости главной цели',
      iconName: 'trophy',
      unlocked: activeGoal ? activeGoal.savedAmount >= activeGoal.totalCost * 0.5 : false,
      rewardCoins: 15,
    },
    {
      id: 'ach_master',
      title: 'Мастер-иллюстратор',
      description: `Помоги ${petName} вырасти до 3-й стадии финансовой зрелости`,
      iconName: 'medal',
      unlocked: state.profile.stage === 3,
      rewardCoins: 20,
    },
  ];

  const filteredTasks =
    selectedTheme === 'all'
      ? tasks
      : selectedTheme === 'trophies'
      ? []
      : tasks.filter((t) => t.theme === selectedTheme);

  const getThemeIcon = (theme: TaskTheme) => {
    switch (theme) {
      case 'budget':
        return <IconPalette size={22} />;
      case 'savings':
        return <IconTarget size={22} color="#7C3AED" />;
      case 'payments':
        return <IconApple size={22} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* 3D Sunny Park Scene */}
      <Image
        source={require('../../assets/scenes/street.jpg')}
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
          <Text style={styles.sceneTitle}>Парк заданий</Text>
        </View>

        <View style={styles.coinPill}>
          <Image source={require('../../assets/coin.png')} style={styles.coinIcon} />
          <Text style={styles.coinText}>{coins}</Text>
        </View>
      </View>

      {/* Finny in the Park */}
      <View style={styles.characterLayer} pointerEvents="box-none">
        <FinnyCharacter />
      </View>

      {/* Bottom Quest Drawer */}
      <View style={styles.questDrawer}>
        {/* Theme Tabs (ТЗ 2.5.8: 3 обязательные темы + Трофеи) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.themeScrollView}
          contentContainerStyle={styles.themeRow}
        >
          <TouchableOpacity
            style={[styles.themeChip, selectedTheme === 'all' && styles.themeChipActive]}
            onPress={() => setSelectedTheme('all')}
          >
            <Text
              style={[styles.themeText, selectedTheme === 'all' && styles.themeTextActive]}
            >
              Все (6)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeChip, selectedTheme === 'budget' && styles.themeChipActive]}
            onPress={() => setSelectedTheme('budget')}
          >
            <Text
              style={[styles.themeText, selectedTheme === 'budget' && styles.themeTextActive]}
            >
              Бюджет (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeChip, selectedTheme === 'savings' && styles.themeChipActive]}
            onPress={() => setSelectedTheme('savings')}
          >
            <Text
              style={[
                styles.themeText,
                selectedTheme === 'savings' && styles.themeTextActive,
              ]}
            >
              Сбережения (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeChip, selectedTheme === 'payments' && styles.themeChipActive]}
            onPress={() => setSelectedTheme('payments')}
          >
            <Text
              style={[
                styles.themeText,
                selectedTheme === 'payments' && styles.themeTextActive,
              ]}
            >
              Покупки (2)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.themeChip, selectedTheme === 'trophies' && styles.themeChipActiveTrophies]}
            onPress={() => setSelectedTheme('trophies')}
          >
            <Text
              style={[
                styles.themeText,
                selectedTheme === 'trophies' && styles.themeTextActive,
              ]}
            >
              Трофеи (6)
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Content List: Tasks or Trophies */}
        {selectedTheme === 'trophies' ? (
          <ScrollView style={styles.questScroll} showsVerticalScrollIndicator={false}>
            {achievements.map((ach) => (
              <View
                key={ach.id}
                style={[styles.trophyCard, ach.unlocked && styles.trophyCardUnlocked]}
              >
                <View style={styles.trophyIconBox}>
                  {ach.iconName === 'medal' ? (
                    <IconMedal size={24} />
                  ) : ach.iconName === 'trophy' ? (
                    <IconTrophy size={24} />
                  ) : ach.iconName === 'palette' ? (
                    <IconPalette size={24} />
                  ) : ach.iconName === 'target' ? (
                    <IconTarget size={24} color="#7C3AED" />
                  ) : ach.iconName === 'apple' ? (
                    <IconApple size={24} />
                  ) : (
                    <IconSparkleStar size={24} />
                  )}
                </View>

                <View style={styles.questInfo}>
                  <Text style={styles.questName}>{ach.title}</Text>
                  <Text style={styles.questDesc}>{ach.description}</Text>
                  <View style={styles.rewardTag}>
                    <Image
                      source={require('../../assets/coin.png')}
                      style={styles.rewardCoin}
                    />
                    <Text style={styles.rewardValue}>+{ach.rewardCoins} монет за достижение</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.trophyBadge,
                    ach.unlocked ? styles.trophyBadgeOk : styles.trophyBadgeProgress,
                  ]}
                >
                  {ach.unlocked ? (
                    <IconCheck size={14} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.trophyBadgeText}>В процессе</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        ) : filteredTasks.length === 0 ? (
          <View style={styles.emptyTasksBox}>
            <Text style={styles.emptyTasksTitle}>В этой теме пока нет заданий</Text>
            <Text style={styles.emptyTasksSub}>
              Выбери другую категорию или вернись к списку «Все», чтобы решить новые финансовые задачи!
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.questScroll} showsVerticalScrollIndicator={false}>
            {filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={[styles.questCard, task.completed && styles.questCardDone]}
                onPress={() => setActiveTask(task)}
                activeOpacity={0.85}
              >
                <View style={styles.questIconBox}>{getThemeIcon(task.theme)}</View>

                <View style={styles.questInfo}>
                  <View style={styles.themeBadge}>
                    <Text style={styles.themeBadgeText}>{task.themeTitle}</Text>
                  </View>
                  <Text style={styles.questName}>{replacePetName(task.title, petName)}</Text>
                  <Text style={styles.questDesc} numberOfLines={2}>
                    {replacePetName(task.scenario, petName)}
                  </Text>

                  <View style={styles.rewardTag}>
                    <Image
                      source={require('../../assets/coin.png')}
                      style={styles.rewardCoin}
                    />
                    <Text style={styles.rewardValue}>+{task.reward} монет</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusCircle,
                    task.completed ? styles.statusCircleDone : styles.statusCirclePending,
                  ]}
                >
                  {task.completed ? (
                    <IconCheck size={16} color="#FFFFFF" />
                  ) : (
                    <Text style={styles.statusGoText}>Старт</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Interactive Task Scenario Modal */}
      <TaskModal
        visible={!!activeTask}
        task={activeTask}
        petName={petName}
        onClose={() => setActiveTask(null)}
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
  questDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '44%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 14,
    paddingBottom: 20,
    paddingHorizontal: 16,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  themeScrollView: {
    height: 42,
    maxHeight: 42,
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  themeChip: {
    height: 34,
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  themeChipActiveTrophies: {
    backgroundColor: '#D97706',
    borderColor: '#D97706',
  },
  themeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  themeTextActive: {
    color: '#FFFFFF',
  },
  questScroll: {
    flex: 1,
  },
  questCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
    minHeight: 52, // kid accessibility
  },
  questCardDone: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  questIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questInfo: {
    flex: 1,
  },
  themeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  themeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#1D4ED8',
    textTransform: 'uppercase',
  },
  questName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  questDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginBottom: 6,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardCoin: {
    width: 14,
    height: 14,
  },
  rewardValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#D97706',
  },
  statusCircle: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCircleDone: {
    backgroundColor: '#16A34A',
  },
  statusCirclePending: {
    backgroundColor: '#2563EB',
  },
  statusGoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trophyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  trophyCardUnlocked: {
    backgroundColor: '#FEFDF8',
    borderColor: '#FDE68A',
  },
  trophyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  trophyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyBadgeOk: {
    backgroundColor: '#16A34A',
  },
  trophyBadgeProgress: {
    backgroundColor: '#E2E8F0',
  },
  trophyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  emptyTasksBox: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTasksTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyTasksSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
