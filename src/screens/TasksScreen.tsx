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
} from '../components/GameIcons';
import { FinancialTask, TaskTheme } from '../types/gameTypes';
import { TaskModal } from '../components/TaskModal';

interface TasksScreenProps {
  coins: number;
  tasks: FinancialTask[];
  onBackToRoom: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const TasksScreen: React.FC<TasksScreenProps> = ({
  coins,
  tasks,
  onBackToRoom,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<'all' | TaskTheme>('all');
  const [activeTask, setActiveTask] = useState<FinancialTask | null>(null);

  const filteredTasks =
    selectedTheme === 'all' ? tasks : tasks.filter((t) => t.theme === selectedTheme);

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
        {/* Theme Tabs (ТЗ 2.5.8: 3 обязательные темы) */}
        <View style={styles.themeRow}>
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
        </View>

        {/* Quest List */}
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
                <Text style={styles.questName}>{task.title}</Text>
                <Text style={styles.questDesc} numberOfLines={2}>
                  {task.scenario}
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
      </View>

      {/* Interactive Task Scenario Modal */}
      <TaskModal
        visible={!!activeTask}
        task={activeTask}
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
  themeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  themeChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primaryDark,
  },
  themeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
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
});
