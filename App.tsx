import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  useWindowDimensions,
  Animated,
  BackHandler,
} from 'react-native';
import { RoomScreen } from './src/screens/RoomScreen';
import { PlanScreen } from './src/screens/PlanScreen';
import { ShopScreen } from './src/screens/ShopScreen';
import { SavingsScreen } from './src/screens/SavingsScreen';
import { TasksScreen } from './src/screens/TasksScreen';
import { BottomTabBar, GameLocation } from './src/components/BottomTabBar';
import {
  CollectModal,
  ScratchModal,
} from './src/components/Modals';
import { ParentZoneModal } from './src/components/ParentZoneModal';
import { OnboardingModal } from './src/components/OnboardingModal';
import { PeriodSummaryModal } from './src/components/PeriodSummaryModal';
import { TaskModal } from './src/components/TaskModal';
import { gameStore, GameState } from './src/state/gameStore';
import { FinancialTask, PeriodSummary } from './src/types/gameTypes';
import { PET_CUSTOM_ASSETS } from './src/pet/petFrames';
import { PET_STAGES } from './src/state/gameData';

export default function App() {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Reactive Game Store State
  const [gameState, setGameState] = useState<GameState>(gameStore.getState());

  useEffect(() => {
    const unsubscribe = gameStore.subscribe(() => {
      setGameState({ ...gameStore.getState() });
    });
    return unsubscribe;
  }, []);

  // Current Game Location
  const [currentLocation, setCurrentLocation] = useState<GameLocation>('room');
  const [subCategory, setSubCategory] = useState<string>('all');

  // Modals Visibility
  const [collectModalVisible, setCollectModalVisible] = useState(false);
  const [scratchModalVisible, setScratchModalVisible] = useState(false);
  const [parentZoneVisible, setParentZoneVisible] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(!gameState.profile.onboardingCompleted);
  const [activeTaskModal, setActiveTaskModal] = useState<FinancialTask | null>(null);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);

  useEffect(() => {
    if (!gameState.profile.onboardingCompleted) {
      setOnboardingVisible(true);
    }
  }, [gameState.profile.onboardingCompleted]);

  // Android Hardware Back Button Handling
  useEffect(() => {
    const onBackPress = () => {
      if (periodSummary) {
        setPeriodSummary(null);
        return true;
      }
      if (activeTaskModal) {
        setActiveTaskModal(null);
        return true;
      }
      if (collectModalVisible) {
        setCollectModalVisible(false);
        return true;
      }
      if (scratchModalVisible) {
        setScratchModalVisible(false);
        return true;
      }
      if (parentZoneVisible) {
        setParentZoneVisible(false);
        return true;
      }
      if (onboardingVisible && gameState.profile.onboardingCompleted) {
        setOnboardingVisible(false);
        return true;
      }
      if (currentLocation !== 'room') {
        navigateTo('room');
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [
    periodSummary,
    activeTaskModal,
    collectModalVisible,
    scratchModalVisible,
    parentZoneVisible,
    onboardingVisible,
    gameState.profile.onboardingCompleted,
    currentLocation,
  ]);

  // Smooth Location Crossfade
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const navigateTo = (nextLocation: GameLocation) => {
    if (nextLocation === currentLocation) return;

    Animated.timing(fadeAnim, {
      toValue: 0.25,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      setCurrentLocation(nextLocation);
      setSubCategory('all');
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  // Economy Handlers
  const handleClaimDailyReward = (amount: number, title?: string) => {
    gameStore.claimDailyReward(amount, title || 'Ежедневная награда');
  };

  const handleDepositToGoal = (amount: number) => {
    gameStore.depositToGoal(amount);
  };

  // Handle contextual actions from bottom bar
  const handleSubCategoryAction = (action: string) => {
    setSubCategory(action);
    if (action === 'deposit') {
      handleDepositToGoal(5);
    }
  };

  const activeGoal =
    gameState.goals.find((g) => g.id === gameState.activeGoalId) || gameState.goals[0];
  const pendingTask = gameState.tasks.find((t) => !t.completed) || gameState.tasks[0];

  const currentAppearance = gameState.profile.appearance;
  const currentStage =
    PET_STAGES.find((s) => s.stage === gameState.profile.stage) || PET_STAGES[0];
  const avatarKey =
    currentAppearance.hat === 'beret'
      ? 'beret'
      : currentAppearance.hat === 'glasses'
      ? 'glasses'
      : currentAppearance.sweaterColor || 'green';
  const currentAvatarSource =
    (PET_CUSTOM_ASSETS.thumbs as any)[avatarKey] || PET_CUSTOM_ASSETS.thumbs.green;

  const isWeb = Platform.OS === 'web';
  const isWideScreen = isWeb && windowWidth > 540;

  return (
    <View style={styles.rootBackground}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Frame for Web Browser to ensure exact mobile device aspect ratio */}
      <View
        style={[
          styles.deviceFrame,
          isWideScreen && {
            width: Math.min(440, windowWidth - 32),
            height: Math.min(920, windowHeight - 32),
            borderRadius: 36,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 16 },
            shadowOpacity: 0.35,
            shadowRadius: 32,
            elevation: 20,
          },
        ]}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Main Animated Game World Content */}
          <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            {currentLocation === 'room' && (
              <RoomScreen
                coins={gameState.coins}
                period={gameState.period}
                petState={gameState.petState}
                activeGoal={activeGoal}
                activeTask={pendingTask}
                appearance={gameState.profile.appearance}
                playerName={gameState.profile.playerName || 'Зайка'}
                stageTitle={currentStage.title}
                avatarSource={currentAvatarSource}
                onCollectReward={() => setCollectModalVisible(true)}
                onOpenShop={() => navigateTo('shop')}
                onOpenScratch={() => setScratchModalVisible(true)}
                onOpenProfile={() => setOnboardingVisible(true)}
                onOpenParentZone={() => setParentZoneVisible(true)}
                onGoalCardPress={() => navigateTo('savings')}
                onOpenTaskPress={() => setActiveTaskModal(pendingTask)}
              />
            )}

            {currentLocation === 'plan' && (
              <PlanScreen
                period={gameState.period}
                coins={gameState.coins}
                budgetPlan={gameState.budgetPlan}
                budgetFact={gameState.budgetFact}
                activeGoal={activeGoal}
                onBackToRoom={() => navigateTo('room')}
                onPeriodAdvanced={() => {
                  const summaries = gameStore.getState().periodSummaries;
                  if (summaries.length > 0) {
                    setPeriodSummary(summaries[summaries.length - 1]);
                  }
                }}
              />
            )}

            {currentLocation === 'shop' && (
              <ShopScreen
                coins={gameState.coins}
                subCategory={subCategory}
                onBackToRoom={() => navigateTo('room')}
                onNavigateToTasks={() => navigateTo('tasks')}
              />
            )}

            {currentLocation === 'savings' && (
              <SavingsScreen
                coins={gameState.coins}
                goals={gameState.goals}
                activeGoalId={gameState.activeGoalId}
                subCategory={subCategory}
                onDeposit={handleDepositToGoal}
                onBackToRoom={() => navigateTo('room')}
              />
            )}

            {currentLocation === 'tasks' && (
              <TasksScreen
                coins={gameState.coins}
                tasks={gameState.tasks}
                subCategory={subCategory}
                onBackToRoom={() => navigateTo('room')}
              />
            )}
          </Animated.View>

          {/* Contextual Bottom Game Navigation Bar */}
          <BottomTabBar
            currentLocation={currentLocation}
            onNavigate={navigateTo}
            subCategory={subCategory}
            onSubCategoryChange={handleSubCategoryAction}
          />

          {/* Modals & Overlays */}
          <CollectModal
            visible={collectModalVisible}
            onClose={() => setCollectModalVisible(false)}
            onClaim={(amt) => handleClaimDailyReward(amt, 'Ежедневный подарок')}
          />

          <ScratchModal
            visible={scratchModalVisible}
            onClose={() => setScratchModalVisible(false)}
            onReward={(amt) => handleClaimDailyReward(amt, 'Счастливый билет')}
          />

          {/* Parent & Expert Review Modal (ТЗ 2.5.12 & 2.5.13) */}
          <ParentZoneModal
            visible={parentZoneVisible}
            onClose={() => setParentZoneVisible(false)}
          />

          {/* Onboarding & Customization (ТЗ 2.5.1 & 2.5.2) */}
          <OnboardingModal
            visible={onboardingVisible}
            onClose={() => setOnboardingVisible(false)}
          />

          {/* Interactive Task Scenario Modal */}
          <TaskModal
            visible={!!activeTaskModal}
            task={activeTaskModal}
            onClose={() => setActiveTaskModal(null)}
          />

          {/* Period Summary & Growth Modal (ТЗ 2.5.10 & 2.6) */}
          <PeriodSummaryModal
            visible={!!periodSummary}
            summary={periodSummary}
            stage={gameState.profile.stage}
            onClose={() => setPeriodSummary(null)}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rootBackground: {
    flex: 1,
    backgroundColor: '#1E1B18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deviceFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FAF5EE',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FAF5EE',
  },
});
