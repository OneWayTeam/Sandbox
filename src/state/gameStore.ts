import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  UserProfile,
  PetState,
  BudgetPlan,
  BudgetFact,
  FinancialGoal,
  FinancialTask,
  ShopItem,
  PeriodSummary,
  PetAppearance,
  GameTransaction,
  EducationalProgress,
} from '../types/gameTypes';
import { INITIAL_SHOP_ITEMS } from './gameData';
import { GameEngine, EngineState, createDefaultEngineState } from '../engine/GameEngine';
import { StorageManager } from '../storage/StorageManager';

export interface GameState {
  profile: UserProfile;
  coins: number;
  savings: number;
  period: number;
  petState: PetState;
  budgetPlan: BudgetPlan;
  budgetFact: BudgetFact;
  goals: FinancialGoal[];
  activeGoalId: string;
  tasks: FinancialTask[];
  shopItems: ShopItem[];
  purchasedItemIds: string[];
  periodSummaries: PeriodSummary[];
  transactions: GameTransaction[];
  isDemonstrationMode: boolean;
  educationalProgress: EducationalProgress;
}

class GameStore {
  private engine: GameEngine;
  private listeners: Array<() => void> = [];

  constructor() {
    this.engine = new GameEngine();
    this.load();
  }

  public getEngine(): GameEngine {
    return this.engine;
  }

  public getState(): GameState {
    const s = this.engine.getState();

    // Merge transactions from income and purchases sorted by timestamp
    const allTransactions: GameTransaction[] = [
      ...s.incomeHistory,
      ...s.purchaseHistory,
    ].sort((a, b) => b.timestamp - a.timestamp);

    return {
      profile: { ...s.playerProfile },
      coins: s.balance,
      savings: s.savings,
      period: s.currentPeriod,
      petState: { ...s.petState },
      budgetPlan: {
        mandatory: s.plannedMandatory,
        discretionary: s.plannedOptional,
        savings: s.plannedSavings,
        isApproved: s.isBudgetApproved,
      },
      budgetFact: {
        mandatory: s.actualMandatory,
        discretionary: s.actualOptional,
        savings: s.actualSavings,
      },
      goals: s.goals,
      activeGoalId: s.currentGoalId,
      tasks: s.tasks,
      shopItems: [...INITIAL_SHOP_ITEMS],
      purchasedItemIds: [...s.purchasedItemIds],
      periodSummaries: [...s.periodHistory],
      transactions: allTransactions,
      isDemonstrationMode: s.demoModeState,
      educationalProgress: { ...s.educationalProgress },
    };
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
    this.save();
  }

  // --- PERSISTENCE DELEGATED TO STORAGEMANAGER ---
  public async load(): Promise<boolean> {
    const res = await StorageManager.load();
    this.engine = new GameEngine(res.state);

    if (res.recoveredFromBackup) {
      this.engine.updatePetState({
        statusText: 'Восстановлено последнее надёжное сохранение сейфа!',
      });
    }

    this.notify();
    return true;
  }

  public async save(): Promise<void> {
    await StorageManager.save(this.engine.getState() as any);
  }

  public async resetTestProfile(): Promise<void> {
    // Reset to deterministic demo test profile
    const demoState = StorageManager.createDeterministicDemoState();
    this.engine = new GameEngine(demoState);
    await StorageManager.save(demoState);
    this.notify();
  }

  public async resetAllLocalData(): Promise<void> {
    // Complete wipe of all storage keys including legacy and backup
    await StorageManager.resetAllStorage();
    this.engine = new GameEngine();
    await StorageManager.save(this.engine.getState() as any);
    this.notify();
  }

  public async deleteProfile(): Promise<void> {
    try {
      this.engine.deleteProfile();
      await StorageManager.resetAllStorage();
    } catch (e) {
      console.warn('Failed to delete profile', e);
    }
    this.notify();
  }

  // --- ACTIONS DELEGATED TO CORE ENGINE ---
  public completeOnboarding(name: string, petName: string, appearance: PetAppearance) {
    const res = this.engine.createProfile(name, petName, appearance);
    if (res.success) {
      this.notify();
    }
    return res;
  }

  public updateProfile(name: string, petName: string, appearance: PetAppearance) {
    const res = this.engine.updatePet(appearance, petName);
    if (name) {
      const s = this.engine.getState() as any;
      s.playerProfile.playerName = name;
    }
    this.notify();
    return res;
  }

  public setAppearance(appearance: PetAppearance) {
    const res = this.engine.updatePet(appearance);
    if (res.success) {
      this.notify();
    }
    return res;
  }

  public claimDailyReward(amount: number, title: string = 'Ежедневная награда') {
    const res = this.engine.receiveIncome(amount, 'daily_reward', title, 'reward');
    if (res.success) {
      this.engine.updatePetState({
        mood: Math.min(100, this.engine.getState().petState.mood + 10),
        statusText: `Получена награда: +${amount} монет!`,
      });
      this.notify();
    }
    return res;
  }

  public grantParentBonus(amount: number, reason: string = 'Поощрение от родителей') {
    const res = this.engine.receiveIncome(amount, 'parent_bonus', reason, 'parent');
    if (res.success) {
      this.engine.updatePetState({
        mood: Math.min(100, this.engine.getState().petState.mood + 15),
        statusText: `Родители похвалили: начислено +${amount} монет!`,
      });
      this.notify();
    }
    return res;
  }

  public approveBudgetPlan(mandatory: number, discretionary: number, savings: number) {
    const res = this.engine.confirmBudget(mandatory, discretionary, savings);
    if (res.success) {
      this.notify();
    }
    return res;
  }

  public completeTask(
    taskId: string,
    optionId: string
  ): { isCorrect: boolean; explanation: string; reward: number } {
    const res = this.engine.completeTask(taskId, optionId);
    if (res.success && res.data) {
      this.notify();
      return res.data;
    }
    return {
      isCorrect: false,
      explanation: res.error || 'Задание не выполнено',
      reward: 0,
    };
  }

  public buyItem(item: ShopItem): { success: boolean; message: string; teachableMoment?: string } {
    const res = this.engine.buyItem(item);
    if (res.success) {
      this.notify();
      return { success: true, message: `Успешно куплено: ${item.title}!` };
    }
    return {
      success: false,
      message: res.error || 'Не удалось совершить покупку',
      teachableMoment: res.teachableMoment,
    };
  }

  public equipItem(itemId: string): { success: boolean; message: string } {
    const petName = this.engine.getState().playerProfile.petName || 'Питомец';
    if (itemId === 'clothes_beret') {
      this.engine.updatePet({ hat: 'beret' });
      this.engine.updatePetState({ statusText: `${petName} примерил(а) берет мастера!` });
      this.notify();
      return { success: true, message: `Берет мастера надет на ${petName}!` };
    }
    if (itemId === 'clothes_scarf') {
      this.engine.updatePetState({
        mood: Math.min(100, this.engine.getState().petState.mood + 10),
        statusText: `${petName} надел(а) тёплый вязаный шарф!`,
      });
      this.notify();
      return { success: true, message: `Тёплый шарф согревает ${petName}!` };
    }
    if (itemId.startsWith('food_')) {
      this.engine.updatePetState({
        satiety: Math.min(100, this.engine.getState().petState.satiety + 20),
        statusText: `${petName} с удовольствием подкрепился(лась)!`,
      });
      this.notify();
      return { success: true, message: 'Питомец покормлен!' };
    }
    this.engine.updatePetState({ statusText: 'Предмет активирован в комнате!' });
    this.notify();
    return { success: true, message: 'Предмет используется!' };
  }

  public depositToGoal(amount: number): { success: boolean; message: string } {
    const res = this.engine.transferToSavings(amount);
    if (res.success) {
      this.notify();
      return { success: true, message: `В копилку цели отложено +${amount} монет!` };
    }
    return { success: false, message: res.error || 'Не удалось пополнить копилку' };
  }

  public withdrawFromGoal(amount: number): { success: boolean; message: string } {
    const res = this.engine.withdrawFromSavings(amount);
    if (res.success) {
      this.notify();
      const goal = this.engine.getCurrentGoal();
      return {
        success: true,
        message: `Снято ${amount} монет. Теперь в цели: ${goal?.savedAmount ?? 0} из ${goal?.totalCost ?? 0}.`,
      };
    }
    return { success: false, message: res.error || 'Не удалось снять монеты' };
  }

  public selectGoal(goalId: string) {
    const res = this.engine.selectGoal(goalId);
    if (res.success) {
      this.notify();
    }
    return res;
  }

  public advancePeriod(): PeriodSummary | null {
    const res = this.engine.finishPeriod();
    if (res.success && res.data) {
      this.notify();
      return res.data;
    }
    return null;
  }

  public setDemonstrationMode(enabled: boolean) {
    (this.engine.getState() as any).demoModeState = enabled;
    this.notify();
  }

  public toggleAnimations(enabled?: boolean) {
    const res = this.engine.toggleAnimations(enabled);
    if (res.success) {
      this.notify();
    }
    return res;
  }
}

export const gameStore = new GameStore();
