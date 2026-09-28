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
import { MiniProfileModal } from './src/components/MiniProfileModal';
import { PeriodSummaryModal } from './src/components/PeriodSummaryModal';
import { TaskModal } from './src/components/TaskModal';
import { gameStore, GameState } from './src/state/gameStore';
import { FinancialTask, PeriodSummary } from './src/types/gameTypes';
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
  const [miniProfileVisible, setMiniProfileVisible] = useState(false);
  const [activeTaskModal, setActiveTaskModal] = useState<FinancialTask | null>(null);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);

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
      if (miniProfileVisible) {
        setMiniProfileVisible(false);
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
    miniProfileVisible,
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

  const currentStage =
    PET_STAGES.find((s) => s.stage === gameState.profile.stage) || PET_STAGES[0];

  const isWeb = Platform.OS === 'web';
  const isWideScreen = isWeb && windowWidth > 540;
  const petName = gameState.profile.petName || 'Финни';

  // 1. Separate dedicated window for first launch / onboarding
  if (!gameState.profile.onboardingCompleted) {
    return (
      <View style={styles.rootBackground}>
        <StatusBar barStyle="dark-content" />
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
          <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FAF5EE' }]}>
            <OnboardingModal
              visible={true}
              isStandalone={true}
              onClose={() => {}}
            />
          </SafeAreaView>
        </View>
      </View>
    );
  }

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
                onCollectReward={() => setCollectModalVisible(true)}
                onOpenShop={() => navigateTo('shop')}
                onOpenScratch={() => setScratchModalVisible(true)}
                onOpenProfile={() => setMiniProfileVisible(true)}
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
                petName={petName}
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
                petName={petName}
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
                petName={petName}
                onDeposit={handleDepositToGoal}
                onBackToRoom={() => navigateTo('room')}
              />
            )}

            {currentLocation === 'tasks' && (
              <TasksScreen
                coins={gameState.coins}
                tasks={gameState.tasks}
                subCategory={subCategory}
                petName={petName}
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
            isAvailable={gameStore.canClaimDailyReward()}
            petName={petName}
            onClose={() => setCollectModalVisible(false)}
            onClaim={(amt) => gameStore.claimDailyReward(amt, 'Ежедневный подарок')}
          />

          <ScratchModal
            visible={scratchModalVisible}
            isAvailable={gameStore.canScratchTicket()}
            onClose={() => setScratchModalVisible(false)}
            onReward={(amt) => gameStore.claimScratchReward(amt, 'Счастливый билет')}
          />

          {/* Parent & Expert Review Modal (ТЗ 2.5.12 & 2.5.13) */}
          <ParentZoneModal
            visible={parentZoneVisible}
            onClose={() => setParentZoneVisible(false)}
          />

          {/* Mini-Profile Modal (ТЗ: просмотр статуса без перезапуска анкеты) */}
          <MiniProfileModal
            visible={miniProfileVisible}
            onClose={() => setMiniProfileVisible(false)}
            onOpenSettings={() => {
              setMiniProfileVisible(false);
              setParentZoneVisible(true);
            }}
            gameState={gameState}
          />

          {/* Interactive Task Scenario Modal */}
          <TaskModal
            visible={!!activeTaskModal}
            task={activeTaskModal}
            petName={petName}
            onClose={() => setActiveTaskModal(null)}
          />

          {/* Period Summary & Growth Modal (ТЗ 2.5.10 & 2.6) */}
          <PeriodSummaryModal
            visible={!!periodSummary}
            summary={periodSummary}
            stage={gameState.profile.stage}
            petName={petName}
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
