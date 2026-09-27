import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { TopHeader } from '../components/TopHeader';
import { FloatingActions } from '../components/FloatingActions';
import { FinnyCharacter } from '../components/FinnyCharacter';
import { GoalCard } from '../components/GoalCard';
import {
  IconApple,
  IconPalette,
  IconSparkleStar,
  IconShieldCheck,
  IconCheck,
} from '../components/GameIcons';
import { PetState, FinancialGoal, FinancialTask, PetAppearance } from '../types/gameTypes';

interface RoomScreenProps {
  coins: number;
  period: number;
  petState: PetState;
  activeGoal: FinancialGoal;
  activeTask?: FinancialTask;
  appearance?: PetAppearance;
  playerName?: string;
  stageTitle?: string;
  avatarSource?: any;
  onCollectReward: () => void;
  onOpenShop: () => void;
  onOpenScratch: () => void;
  onOpenProfile: () => void;
  onOpenParentZone: () => void;
  onGoalCardPress: () => void;
  onOpenTaskPress?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const RoomScreen: React.FC<RoomScreenProps> = ({
  coins,
  period,
  petState,
  activeGoal,
  activeTask,
  appearance,
  playerName = 'Зайка',
  stageTitle = 'Художник',
  avatarSource,
  onCollectReward,
  onOpenShop,
  onOpenScratch,
  onOpenProfile,
  onOpenParentZone,
  onGoalCardPress,
  onOpenTaskPress,
}) => {
  const percentage = Math.round((activeGoal.savedAmount / activeGoal.totalCost) * 100);

  return (
    <View style={styles.container}>
      {/* 1. ROOM BACKGROUND LAYER */}
      <Image
        source={require('../../assets/room_bg.jpg')}
        style={styles.roomBackground}
        resizeMode="cover"
      />

      {/* 2. TOP HUD: Profile & Period & Coins & Parent Zone */}
      <TopHeader
        coins={coins}
        period={period}
        playerName={playerName}
        stageTitle={stageTitle}
        avatarSource={avatarSource}
        onPressProfile={onOpenProfile}
        onPressSettings={onOpenParentZone}
      />

      {/* 3. VITALS HUD BARS (ТЗ 2.5.3: Сытость, Настроение) */}
      <View style={styles.vitalsContainer}>
        {/* Satiety Bar */}
        <View style={styles.vitalPill}>
          <IconApple size={16} />
          <View style={styles.vitalBarBg}>
            <View
              style={[
                styles.vitalBarFill,
                { width: `${petState.satiety}%`, backgroundColor: '#16A34A' },
              ]}
            />
          </View>
          <Text style={styles.vitalText}>{petState.satiety}%</Text>
        </View>

        {/* Mood Bar */}
        <View style={styles.vitalPill}>
          <IconPalette size={16} />
          <View style={styles.vitalBarBg}>
            <View
              style={[
                styles.vitalBarFill,
                { width: `${petState.mood}%`, backgroundColor: '#EA580C' },
              ]}
            />
          </View>
          <Text style={styles.vitalText}>{petState.mood}%</Text>
        </View>

        {/* Parent Zone Quick Access */}
        <TouchableOpacity
          style={styles.parentQuickBtn}
          onPress={onOpenParentZone}
          activeOpacity={0.85}
        >
          <IconShieldCheck size={18} color="#2563EB" />
          <Text style={styles.parentQuickText}>Взрослым</Text>
        </TouchableOpacity>
      </View>

      {/* 4. ACTIVE TASK SHORTCUT BANNER (ТЗ 2.5.3: Активное задание на главном экране) */}
      {activeTask && !activeTask.completed && onOpenTaskPress ? (
        <TouchableOpacity
          style={styles.activeTaskBanner}
          onPress={onOpenTaskPress}
          activeOpacity={0.85}
        >
          <View style={styles.taskStarBox}>
            <IconSparkleStar size={16} />
          </View>
          <View style={styles.taskBannerTextCol}>
            <Text style={styles.taskBannerTitle}>Активное задание:</Text>
            <Text style={styles.taskBannerDesc} numberOfLines={1}>
              {activeTask.title} (+{activeTask.reward} монет)
            </Text>
          </View>
          <View style={styles.taskBannerAction}>
            <Text style={styles.taskBannerActionText}>Решить →</Text>
          </View>
        </TouchableOpacity>
      ) : activeTask && activeTask.completed ? (
        <View style={styles.taskCompletedBanner}>
          <View style={styles.taskCheckCircle}>
            <IconCheck size={14} color="#FFFFFF" />
          </View>
          <View style={styles.taskBannerTextCol}>
            <Text style={styles.taskCompletedTitle}>Задания периода выполнены!</Text>
            <Text style={styles.taskCompletedDesc} numberOfLines={1}>
              Все награды получены. Утверди бюджет в разделе «План»!
            </Text>
          </View>
        </View>
      ) : null}

      {/* 5. FINNY'S THOUGHT BUBBLE / STATUS TEXT */}
      <View style={styles.statusBubble}>
        <Text style={styles.statusText}>{petState.statusText}</Text>
      </View>

      {/* 6. FLOATING ACTION BUTTONS (Right Side) */}
      <FloatingActions
        onCollectPress={onCollectReward}
        onShopPress={onOpenShop}
        onScratchPress={onOpenScratch}
      />

      {/* 7. MAIN 3D CHARACTER WITH CUSTOMIZATION */}
      <View style={styles.characterContainer} pointerEvents="box-none">
        <FinnyCharacter appearance={appearance} />
      </View>

      {/* 8. BOTTOM SECTION: Goal Card */}
      <View style={styles.bottomSection} pointerEvents="box-none">
        <GoalCard
          title={activeGoal.title}
          category={activeGoal.category}
          currentCoins={activeGoal.savedAmount}
          totalCoins={activeGoal.totalCost}
          percentage={percentage}
          onPress={onGoalCardPress}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FAF5EE',
  },
  roomBackground: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  vitalsContainer: {
    position: 'absolute',
    top: 68,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 15,
  },
  vitalPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  vitalBarBg: {
    width: 48,
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  vitalBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  vitalText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  parentQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 246, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 4,
    marginLeft: 'auto',
  },
  parentQuickText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  activeTaskBanner: {
    position: 'absolute',
    top: 108,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskStarBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskBannerTextCol: {
    flex: 1,
  },
  taskBannerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    textTransform: 'uppercase',
  },
  taskBannerDesc: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  taskBannerAction: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskBannerActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  taskCompletedBanner: {
    position: 'absolute',
    top: 108,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 253, 244, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 8,
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  taskCheckCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskCompletedTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  taskCompletedDesc: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
  },
  statusBubble: {
    position: 'absolute',
    top: 158,
    alignSelf: 'center',
    maxWidth: '85%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    zIndex: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    textAlign: 'center',
  },
  characterContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '20%',
    bottom: '24%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  bottomSection: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 8,
    zIndex: 20,
  },
});
