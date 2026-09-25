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
  PetStage,
  PetAppearance,
} from '../types/gameTypes';
import {
  INITIAL_GOALS,
  INITIAL_SHOP_ITEMS,
  INITIAL_TASKS,
  PET_STAGES,
} from './gameData';

const STORAGE_KEY = '@finny_game_storage_v1';

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
  isDemonstrationMode: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  petName: 'Финни',
  playerName: 'Зайка',
  stage: 1,
  appearance: {
    sweaterColor: 'green',
    accessory: 'clover',
    hat: 'none',
  },
  onboardingCompleted: true,
};

const DEFAULT_PET_STATE: PetState = {
  satiety: 75,
  mood: 85,
  energy: 90,
  statusText: 'Финни сыт и вдохновлён на творчество!',
};

const DEFAULT_BUDGET_PLAN: BudgetPlan = {
  mandatory: 10,
  discretionary: 10,
  savings: 10,
  isApproved: false,
};

const DEFAULT_BUDGET_FACT: BudgetFact = {
  mandatory: 0,
  discretionary: 0,
  savings: 0,
};

export const createInitialState = (): GameState => ({
  profile: { ...DEFAULT_PROFILE },
  coins: 25,
  savings: 35,
  period: 1,
  petState: { ...DEFAULT_PET_STATE },
  budgetPlan: { ...DEFAULT_BUDGET_PLAN },
  budgetFact: { ...DEFAULT_BUDGET_FACT },
  goals: JSON.parse(JSON.stringify(INITIAL_GOALS)),
  activeGoalId: 'goal_paints',
  tasks: JSON.parse(JSON.stringify(INITIAL_TASKS)),
  shopItems: [...INITIAL_SHOP_ITEMS],
  purchasedItemIds: [],
  periodSummaries: [],
  isDemonstrationMode: true,
});

class GameStore {
  private state: GameState = createInitialState();
  private listeners: Array<() => void> = [];

  constructor() {
    this.load();
  }

  public getState(): GameState {
    return this.state;
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

  // --- PERSISTENCE ---
  public async load() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.state = {
          ...this.state,
          ...parsed,
          goals: parsed.goals?.length ? parsed.goals : INITIAL_GOALS,
          tasks: parsed.tasks?.length ? parsed.tasks : INITIAL_TASKS,
        };
        this.notify();
      }
    } catch (e) {
      console.warn('Failed to load game store', e);
    }
  }

  public async save() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save game store', e);
    }
  }

  public async resetTestProfile() {
    this.state = createInitialState();
    await AsyncStorage.removeItem(STORAGE_KEY);
    this.notify();
  }

  // --- ACTIONS ---
  public updateProfile(name: string, petName: string, appearance: PetAppearance) {
    this.state.profile.playerName = name || this.state.profile.playerName;
    this.state.profile.petName = petName || this.state.profile.petName;
    this.state.profile.appearance = appearance;
    this.state.profile.onboardingCompleted = true;
    this.notify();
  }

  public setAppearance(appearance: PetAppearance) {
    this.state.profile.appearance = appearance;
    this.notify();
  }

  public approveBudgetPlan(mandatory: number, discretionary: number, savings: number) {
    this.state.budgetPlan = {
      mandatory,
      discretionary,
      savings,
      isApproved: true,
    };
    this.state.petState.statusText = 'Бюджет утверждён! Теперь следуем плану.';
    this.notify();
  }

  public completeTask(taskId: string, optionId: string): { isCorrect: boolean; explanation: string; reward: number } {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (!task) return { isCorrect: false, explanation: '', reward: 0 };

    const option = task.options.find((o) => o.id === optionId);
    if (!option) return { isCorrect: false, explanation: '', reward: 0 };

    task.completed = true;
    task.userChoiceId = optionId;

    // Apply reward
    const reward = option.rewardChange;
    this.state.coins += reward;

    // Apply mood & satiety adjustments
    this.state.petState.mood = Math.min(100, Math.max(10, this.state.petState.mood + option.moodChange));
    if (option.satietyChange) {
      this.state.petState.satiety = Math.min(100, Math.max(10, this.state.petState.satiety + option.satietyChange));
    }

    this.state.petState.statusText = option.isCorrect
      ? 'Финни гордится твоим мудрым решением!'
      : 'Финни понял ошибку и в следующий раз поступит лучше.';

    this.notify();
    return { isCorrect: option.isCorrect, explanation: option.explanation, reward };
  }

  public buyItem(item: ShopItem): { success: boolean; message: string } {
    if (this.state.coins < item.price) {
      const shortage = item.price - this.state.coins;
      return {
        success: false,
        message: `Не хватает ${shortage} монет! Выполни задание в парке или отложи покупку на следующий период.`,
      };
    }

    // Deduct coins
    this.state.coins -= item.price;
    this.state.purchasedItemIds.push(item.id);

    // Track budget fact
    if (item.type === 'mandatory') {
      this.state.budgetFact.mandatory += item.price;
      this.state.petState.satiety = Math.min(100, this.state.petState.satiety + item.satietyBoost);
    } else {
      this.state.budgetFact.discretionary += item.price;
      this.state.petState.mood = Math.min(100, this.state.petState.mood + item.moodBoost);
    }

    this.state.petState.statusText = `Куплено: ${item.title}! Финни счастлив!`;
    this.notify();
    return { success: true, message: `Успешно куплено: ${item.title}!` };
  }

  public depositToGoal(amount: number): { success: boolean; message: string } {
    if (this.state.coins < amount) {
      return { success: false, message: 'Недостаточно свободных монет для пополнения цели.' };
    }

    this.state.coins -= amount;
    this.state.savings += amount;
    this.state.budgetFact.savings += amount;

    // Update active goal
    const goal = this.state.goals.find((g) => g.id === this.state.activeGoalId);
    if (goal) {
      goal.savedAmount = Math.min(goal.totalCost, goal.savedAmount + amount);
      if (goal.savedAmount >= goal.totalCost) {
        this.state.petState.statusText = `Ура! Цель «${goal.title}» полностью достигнута!`;
      } else {
        this.state.petState.statusText = `Отложено +${amount} монет в цель «${goal.title}»!`;
      }
    }

    this.notify();
    return { success: true, message: `В копилку цели отложено +${amount} монет!` };
  }

  public withdrawFromGoal(amount: number): { success: boolean; message: string } {
    const goal = this.state.goals.find((g) => g.id === this.state.activeGoalId);
    if (!goal || goal.savedAmount < amount) {
      return { success: false, message: 'В копилке недостаточно средств.' };
    }

    goal.savedAmount -= amount;
    this.state.savings -= amount;
    this.state.coins += amount;
    this.state.petState.mood = Math.max(20, this.state.petState.mood - 10);
    this.state.petState.statusText = `Снято ${amount} монет из цели. Срок достижения мечты увеличился.`;

    this.notify();
    return {
      success: true,
      message: `Снято ${amount} монет. Теперь в цели: ${goal.savedAmount} из ${goal.totalCost}.`,
    };
  }

  public selectGoal(goalId: string) {
    this.state.activeGoalId = goalId;
    this.notify();
  }

  public advancePeriod(): PeriodSummary {
    const pNum = this.state.period;
    const plan = { ...this.state.budgetPlan };
    const fact = { ...this.state.budgetFact };

    // Discipline check: did user satisfy mandatory and save for goal?
    const disciplined = fact.mandatory > 0 && fact.savings > 0;
    const bonus = disciplined ? 15 : 5;

    const summary: PeriodSummary = {
      periodNumber: pNum,
      plan,
      fact,
      disciplined,
      bonusAwarded: bonus,
    };

    this.state.periodSummaries.push(summary);

    // Period increment
    if (this.state.period < 5) {
      this.state.period += 1;
    } else {
      this.state.period = 1; // loop or keep at 5
    }

    // Award base allowance + discipline bonus
    this.state.coins += 20 + bonus;

    // Check pet growth stage (ТЗ 2.5.10 & 2.6: не менее 3 стадий развития)
    if (this.state.period >= 4) {
      this.state.profile.stage = 3; // Мастер-иллюстратор
    } else if (this.state.period >= 2) {
      this.state.profile.stage = 2; // Юный мастер
    } else {
      this.state.profile.stage = 1; // Малыш
    }

    // Reset period fact & plan for new period
    this.state.budgetFact = { mandatory: 0, discretionary: 0, savings: 0 };
    this.state.budgetPlan = { mandatory: 10, discretionary: 10, savings: 10, isApproved: false };

    // Uncomplete tasks for demo repeat
    if (this.state.isDemonstrationMode) {
      this.state.tasks.forEach((t) => {
        t.completed = false;
        t.userChoiceId = undefined;
      });
    }

    this.state.petState.statusText = `Наступил Период ${this.state.period}! Доход начислен: +${20 + bonus} монет!`;
    this.notify();
    return summary;
  }

  public setDemonstrationMode(enabled: boolean) {
    this.state.isDemonstrationMode = enabled;
    this.notify();
  }
}

export const gameStore = new GameStore();
