import {
  UserProfile,
  PetState,
  PetStage,
  PetAppearance,
  PetReactionType,
  PetReactionEvent,
  GameSettings,
  BudgetPlan,
  BudgetFact,
  FinancialGoal,
  FinancialTask,
  ShopItem,
  PeriodSummary,
  PeriodVariance,
  EducationalProgress,
  GameTransaction,
  GameAchievement,
} from '../types/gameTypes';
import {
  INITIAL_GOALS,
  INITIAL_SHOP_ITEMS,
  INITIAL_TASKS,
  PET_STAGES,
} from '../state/gameData';
import { PetStateManager } from '../pet/petStateManager';
import { PetDevelopmentEngine } from '../pet/petDevelopmentEngine';

export interface EngineState {
  playerProfile: UserProfile;
  petState: PetState;
  petCustomization: PetAppearance;
  balance: number;
  savings: number;
  currentPeriod: number;
  plannedMandatory: number;
  plannedOptional: number;
  plannedSavings: number;
  isBudgetApproved: boolean;
  actualMandatory: number;
  actualOptional: number;
  actualSavings: number;
  goals: FinancialGoal[];
  currentGoalId: string;
  tasks: FinancialTask[];
  taskRewardsTotal: number;
  claimedRewardIds: string[];
  purchasedItemIds: string[];
  purchaseHistory: GameTransaction[];
  incomeHistory: GameTransaction[];
  periodHistory: PeriodSummary[];
  petDevelopmentStage: PetStage;
  educationalProgress: EducationalProgress;
  demoModeState: boolean;
  settings?: GameSettings;
}

export interface EngineResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
  teachableMoment?: string;
}

export const createDefaultEngineState = (): EngineState => {
  const initialGoals: FinancialGoal[] = JSON.parse(JSON.stringify(INITIAL_GOALS));
  const initialTasks: FinancialTask[] = JSON.parse(JSON.stringify(INITIAL_TASKS));

  return {
    playerProfile: {
      petName: 'Финни',
      playerName: 'Юный финансист',
      stage: 1,
      appearance: {
        sweaterColor: 'green',
        accessory: 'clover',
        hat: 'none',
      },
      onboardingCompleted: false,
    },
    petState: {
      satiety: 80,
      mood: 85,
      energy: 90,
      statusText: 'Привет! Финни готов учиться финансовой грамотности!',
      moodState: 'happy',
    },
    petCustomization: {
      sweaterColor: 'green',
      accessory: 'clover',
      hat: 'none',
    },
    balance: 25,
    savings: 35,
    currentPeriod: 1,
    plannedMandatory: 10,
    plannedOptional: 5,
    plannedSavings: 10,
    isBudgetApproved: false,
    actualMandatory: 0,
    actualOptional: 0,
    actualSavings: 0,
    goals: initialGoals,
    currentGoalId: 'goal_paints',
    tasks: initialTasks,
    taskRewardsTotal: 0,
    claimedRewardIds: [],
    purchasedItemIds: [],
    purchaseHistory: [],
    incomeHistory: [
      {
        id: 'tx_init',
        timestamp: Date.now(),
        period: 1,
        type: 'income',
        title: 'Стартовый капитал на 1-й период',
        amount: 25,
        source: 'starter_capital',
        category: 'budget',
      },
    ],
    periodHistory: [],
    petDevelopmentStage: 1,
    educationalProgress: {
      totalTasksCompleted: 0,
      correctAnswersCount: 0,
      themesCompleted: [],
      achievementsUnlocked: [],
      literacyLevel: 'Новичок',
    },
    demoModeState: false,
    settings: {
      animationsEnabled: true,
    },
  };
};

export class GameEngine {
  private state: EngineState;

  constructor(initialState?: EngineState) {
    this.state = initialState ? JSON.parse(JSON.stringify(initialState)) : createDefaultEngineState();
  }

  public getState(): Readonly<EngineState> {
    return this.state;
  }

  public getSnapshot(): string {
    return JSON.stringify(this.state);
  }

  public restoreSnapshot(json: string): boolean {
    try {
      const parsed = JSON.parse(json);
      if (typeof parsed.balance !== 'number' || typeof parsed.currentPeriod !== 'number') {
        return false;
      }
      this.state = parsed;
      return true;
    } catch {
      return false;
    }
  }

  // --- ATOMIC TRANSACTION RUNNER ---
  private runTransaction<T>(operation: () => EngineResult<T>): EngineResult<T> {
    const backup = JSON.stringify(this.state);
    try {
      const res = operation();
      if (!res.success) {
        this.state = JSON.parse(backup);
      }
      return res;
    } catch (e: any) {
      this.state = JSON.parse(backup);
      return { success: false, error: e?.message || 'Внутренняя ошибка операции' };
    }
  }

  // --- PET REACTION & MOOD SYNCHRONIZATION ---
  public emitReaction(type: PetReactionType, message: string, icon?: string): void {
    this.state.petState.lastReaction = {
      type,
      message,
      icon,
      timestamp: Date.now(),
    };
    this.syncPetMood(type);
  }

  public syncPetMood(lastActionType?: string): void {
    const activeGoal = this.getCurrentGoal();
    const percent = activeGoal
      ? Math.round((activeGoal.savedAmount / activeGoal.totalCost) * 100)
      : 0;
    const evalResult = PetStateManager.evaluate({
      satiety: this.state.petState.satiety,
      mood: this.state.petState.mood,
      currentPeriod: this.state.currentPeriod,
      actualMandatory: this.state.actualMandatory,
      plannedMandatory: this.state.plannedMandatory,
      actualSavings: this.state.actualSavings,
      isBudgetApproved: this.state.isBudgetApproved,
      tasksCompletedInPeriod: this.state.tasks.filter((t) => t.completed).length,
      activeGoalPercent: percent,
      lastActionType,
    });
    this.state.petState.moodState = evalResult.moodState;
    this.state.petState.statusText = evalResult.statusText;
    this.state.petState.explanation = evalResult.explanation;
  }

  public toggleAnimations(enabled?: boolean): EngineResult<boolean> {
    return this.runTransaction(() => {
      if (!this.state.settings) {
        this.state.settings = { animationsEnabled: true };
      }
      this.state.settings.animationsEnabled =
        enabled !== undefined ? enabled : !this.state.settings.animationsEnabled;
      return { success: true, data: this.state.settings.animationsEnabled };
    });
  }

  // 1. CREATE PROFILE
  public createProfile(
    playerName: string,
    petName: string,
    appearance: PetAppearance
  ): EngineResult<void> {
    return this.runTransaction(() => {
      const pName = playerName.trim() || 'Юный финансист';
      const pet = petName.trim() || 'Финни';

      this.state.playerProfile.playerName = pName;
      this.state.playerProfile.petName = pet;
      this.state.playerProfile.appearance = { ...appearance };
      this.state.playerProfile.onboardingCompleted = true;
      this.state.petCustomization = { ...appearance };

      // Ensure initial starting balance is set with clear source
      if (this.state.balance <= 0) {
        this.state.balance = 25;
        this.recordIncome(25, 'starter_capital', 'Стартовый капитал на 1-й период', 'budget');
      }

      this.state.petState.statusText = `Привет, ${pName}! Я ${pet}. Давай распределим стартовый бюджет (25 монет) во вкладке «План»!`;
      return { success: true };
    });
  }

  // 2. UPDATE PET
  public updatePet(
    appearance: Partial<PetAppearance>,
    petName?: string
  ): EngineResult<void> {
    return this.runTransaction(() => {
      if (petName) {
        this.state.playerProfile.petName = petName.trim();
      }
      this.state.petCustomization = {
        ...this.state.petCustomization,
        ...appearance,
      };
      this.state.playerProfile.appearance = { ...this.state.petCustomization };
      return { success: true };
    });
  }

  // 3. START PERIOD
  public startPeriod(periodNumber?: number): EngineResult<void> {
    return this.runTransaction(() => {
      const nextPeriod = periodNumber ?? (this.state.currentPeriod + 1);
      this.state.currentPeriod = nextPeriod;

      // Reset period fact
      this.state.actualMandatory = 0;
      this.state.actualOptional = 0;
      this.state.actualSavings = 0;

      // Reset budget approval for new period
      this.state.isBudgetApproved = false;
      this.state.plannedMandatory = 10;
      this.state.plannedOptional = 5;
      this.state.plannedSavings = 10;

      this.updatePetGrowth();
      this.state.petState.statusText = `Наступил Период ${this.state.currentPeriod}! Проверь план бюджета на новый период.`;
      return { success: true };
    });
  }

  // 4. RECEIVE INCOME
  public receiveIncome(
    amount: number,
    source: string,
    title: string,
    category: string = 'income'
  ): EngineResult<number> {
    return this.runTransaction(() => {
      if (amount <= 0 || !Number.isFinite(amount)) {
        return { success: false, error: 'Сумма дохода должна быть больше нуля' };
      }
      if (!source || source.trim().length === 0) {
        return { success: false, error: 'Каждое поступление должно иметь подтверждённый источник' };
      }

      this.state.balance += amount;
      this.recordIncome(amount, source, title, category);
      this.emitReaction('income', `+${amount} монет: ${title}!`);

      return { success: true, data: this.state.balance };
    });
  }

  // 5. PLAN BUDGET
  public planBudget(
    mandatory: number,
    optional: number,
    savings: number
  ): EngineResult<void> {
    return this.runTransaction(() => {
      if (mandatory < 0 || optional < 0 || savings < 0) {
        return { success: false, error: 'Статьи бюджета не могут быть отрицательными' };
      }
      this.state.plannedMandatory = mandatory;
      this.state.plannedOptional = optional;
      this.state.plannedSavings = savings;
      this.state.isBudgetApproved = false;
      return { success: true };
    });
  }

  // 6. CONFIRM BUDGET
  public confirmBudget(
    mandatory: number,
    optional: number,
    savings: number
  ): EngineResult<void> {
    return this.runTransaction(() => {
      if (mandatory < 0 || optional < 0 || savings < 0) {
        return { success: false, error: 'Статьи бюджета не могут быть отрицательными' };
      }
      const totalPlanned = mandatory + optional + savings;
      // Budget plan cannot exceed available balance or baseline income
      const availableCapacity = Math.max(this.state.balance, 25);
      if (totalPlanned > availableCapacity) {
        return {
          success: false,
          error: `Сумма плана (${totalPlanned} монет) превышает доступный лимит (${availableCapacity} монет)`,
        };
      }

      this.state.plannedMandatory = mandatory;
      this.state.plannedOptional = optional;
      this.state.plannedSavings = savings;
      this.state.isBudgetApproved = true;
      this.state.petState.statusText = 'Личный бюджет утверждён! Следуем плану.';
      return { success: true };
    });
  }

  // 7. BUY ITEM
  public buyItem(item: ShopItem): EngineResult<{ purchasedItem: ShopItem; newBalance: number }> {
    return this.runTransaction(() => {
      // 1. Balance validation
      if (this.state.balance < item.price) {
        const shortage = item.price - this.state.balance;
        return {
          success: false,
          error: `Не хватает ${shortage} монет! Выполни задание в парке или отложи покупку.`,
          teachableMoment: `Недостаток средств: для покупки за ${item.price} монет требуется ещё ${shortage}. Сначала закрой обязательные нужды.`,
        };
      }

      // 2. Repeat purchase check for non-consumable goods
      if (item.type === 'discretionary' && this.state.purchasedItemIds.includes(item.id)) {
        return {
          success: false,
          error: `Предмет «${item.title}» уже приобретён и находится в твоём рюкзаке!`,
        };
      }

      // 3. Deduct balance
      this.state.balance -= item.price;
      if (!this.state.purchasedItemIds.includes(item.id)) {
        this.state.purchasedItemIds.push(item.id);
      }

      // 4. Update actual facts & vitals
      if (item.type === 'mandatory') {
        this.state.actualMandatory += item.price;
        this.state.petState.satiety = Math.min(100, this.state.petState.satiety + item.satietyBoost);
      } else {
        this.state.actualOptional += item.price;
        this.state.petState.mood = Math.min(100, this.state.petState.mood + item.moodBoost);
      }

      // 5. Record transaction
      const tx: GameTransaction = {
        id: `tx_buy_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        period: this.state.currentPeriod,
        type: item.type === 'mandatory' ? 'mandatory' : 'discretionary',
        title: `Покупка: ${item.title}`,
        amount: -item.price,
        source: `shop:${item.id}`,
        category: item.category,
      };
      this.state.purchaseHistory.unshift(tx);

      this.emitReaction('purchase', `Куплено: ${item.title}!`);
      return {
        success: true,
        data: { purchasedItem: item, newBalance: this.state.balance },
      };
    });
  }

  // 8. TRANSFER TO SAVINGS
  public transferToSavings(amount: number): EngineResult<{ newSavings: number; newBalance: number }> {
    return this.runTransaction(() => {
      if (amount <= 0 || !Number.isFinite(amount)) {
        return { success: false, error: 'Сумма накопления должна быть положительной' };
      }
      if (this.state.balance < amount) {
        return {
          success: false,
          error: `Недостаточно свободных монет: на балансе ${this.state.balance}, требуется ${amount}`,
          teachableMoment: 'Нельзя отложить больше, чем есть в кошельке. Сохраняй баланс между текущими расходами и копилкой.',
        };
      }

      this.state.balance -= amount;
      this.state.savings += amount;
      this.state.actualSavings += amount;

      // Update goal
      const activeGoal = this.getCurrentGoal();
      if (activeGoal) {
        activeGoal.savedAmount = Math.min(activeGoal.totalCost, activeGoal.savedAmount + amount);
        if (activeGoal.savedAmount >= activeGoal.totalCost) {
          this.state.petState.statusText = `Ура! Главная цель «${activeGoal.title}» полностью достигнута!`;
        } else {
          this.state.petState.statusText = `Отложено +${amount} монет в цель «${activeGoal.title}»!`;
        }
      }

      // Record transaction
      const tx: GameTransaction = {
        id: `tx_sav_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        period: this.state.currentPeriod,
        type: 'savings_deposit',
        title: activeGoal ? `Копилка «${activeGoal.title}»` : 'Пополнение сбережений',
        amount: -amount,
        source: `savings_transfer:${this.state.currentGoalId}`,
        category: 'savings',
      };
      this.state.purchaseHistory.unshift(tx);
      this.emitReaction('savings', `+${amount} монет в копилку!`);

      return {
        success: true,
        data: { newSavings: this.state.savings, newBalance: this.state.balance },
      };
    });
  }

  // 9. WITHDRAW FROM SAVINGS
  public withdrawFromSavings(amount: number): EngineResult<{ newSavings: number; newBalance: number }> {
    return this.runTransaction(() => {
      if (amount <= 0 || !Number.isFinite(amount)) {
        return { success: false, error: 'Сумма снятия должна быть больше нуля' };
      }

      const activeGoal = this.getCurrentGoal();
      if (!activeGoal || activeGoal.savedAmount < amount) {
        return { success: false, error: 'В выбранной копилке недостаточно средств для снятия' };
      }
      if (this.state.savings < amount) {
        return { success: false, error: 'Недостаточно средств в общем сейфе' };
      }

      activeGoal.savedAmount -= amount;
      this.state.savings -= amount;
      this.state.balance += amount;

      // Mood consequence of delaying dream
      this.state.petState.mood = Math.max(20, this.state.petState.mood - 10);
      this.state.petState.statusText = `Снято ${amount} монет из цели. Срок достижения мечты увеличился.`;

      // Record transaction
      const tx: GameTransaction = {
        id: `tx_wdr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: Date.now(),
        period: this.state.currentPeriod,
        type: 'savings_withdraw',
        title: `Снято из копилки «${activeGoal.title}»`,
        amount: amount,
        source: `savings_withdraw:${this.state.currentGoalId}`,
        category: 'savings',
      };
      this.state.incomeHistory.unshift(tx);

      return {
        success: true,
        data: { newSavings: this.state.savings, newBalance: this.state.balance },
        teachableMoment: `Досрочное снятие ${amount} монет увеличило срок накопления цели «${activeGoal.title}». Старайся не трогать копилку без острой необходимости.`,
      };
    });
  }

  // 10. SELECT GOAL
  public selectGoal(goalId: string): EngineResult<FinancialGoal> {
    return this.runTransaction(() => {
      const goal = this.state.goals.find((g) => g.id === goalId);
      if (!goal) {
        return { success: false, error: 'Цель с указанным ID не найдена' };
      }
      this.state.currentGoalId = goalId;
      return { success: true, data: goal };
    });
  }

  // 11. COMPLETE TASK
  public completeTask(
    taskId: string,
    optionId: string
  ): EngineResult<{ isCorrect: boolean; explanation: string; reward: number }> {
    return this.runTransaction(() => {
      const task = this.state.tasks.find((t) => t.id === taskId);
      if (!task) {
        return { success: false, error: 'Задание не найдено' };
      }

      // Check if reward was already claimed for this task in current run
      const rewardKey = `reward_task_${taskId}_period_${this.state.currentPeriod}`;
      if (this.state.claimedRewardIds.includes(rewardKey)) {
        return { success: false, error: 'Награда за это задание уже получена в данном периоде' };
      }

      const option = task.options.find((o) => o.id === optionId);
      if (!option) {
        return { success: false, error: 'Выбранный вариант ответа не найден' };
      }

      task.completed = true;
      task.userChoiceId = optionId;
      this.state.claimedRewardIds.push(rewardKey);

      // Apply reward
      const reward = option.rewardChange;
      this.state.balance += reward;
      this.state.taskRewardsTotal += reward;

      // Adjust vitals
      this.state.petState.mood = Math.min(100, Math.max(10, this.state.petState.mood + option.moodChange));
      if (option.satietyChange) {
        this.state.petState.satiety = Math.min(100, Math.max(10, this.state.petState.satiety + option.satietyChange));
      }

      // Record transaction
      this.recordIncome(reward, `task:${task.id}`, `Задание: «${task.title}»`, task.theme);

      // Update educational progress
      this.state.educationalProgress.totalTasksCompleted += 1;
      if (option.isCorrect) {
        this.state.educationalProgress.correctAnswersCount += 1;
      }
      if (!this.state.educationalProgress.themesCompleted.includes(task.theme)) {
        this.state.educationalProgress.themesCompleted.push(task.theme);
      }
      this.updateLiteracyLevel();

      this.state.petState.statusText = option.isCorrect
        ? 'Финни гордится твоим мудрым решением!'
        : 'Финни понял ошибку и в следующий раз поступит лучше.';

      this.emitReaction('task_completed', `+${reward} монет за задачу!`);

      return {
        success: true,
        data: { isCorrect: option.isCorrect, explanation: option.explanation, reward },
      };
    });
  }

  // 12. FINISH PERIOD
  public finishPeriod(): EngineResult<PeriodSummary> {
    return this.runTransaction(() => {
      const pNum = this.state.currentPeriod;
      const plan: BudgetPlan = {
        mandatory: this.state.plannedMandatory,
        discretionary: this.state.plannedOptional,
        savings: this.state.plannedSavings,
        isApproved: this.state.isBudgetApproved,
      };

      const fact: BudgetFact = {
        mandatory: this.state.actualMandatory,
        discretionary: this.state.actualOptional,
        savings: this.state.actualSavings,
      };

      const variance: PeriodVariance = {
        mandatory: fact.mandatory - plan.mandatory,
        discretionary: fact.discretionary - plan.discretionary,
        savings: fact.savings - plan.savings,
      };

      // Discipline check: must have closed mandatory expenses and saved towards goal
      const disciplined = fact.mandatory >= Math.min(plan.mandatory, 5) && fact.savings > 0;
      const bonus = disciplined ? 15 : 5;

      const stageBefore = this.state.petDevelopmentStage;

      // Calculate consequences on pet vitals
      const consequences = this.calculateConsequences();

      // Stage progression check
      this.updatePetGrowth();
      const stageAfter = this.state.petDevelopmentStage;

      let teachableMoment: string | undefined;
      if (!disciplined) {
        teachableMoment = 'В этом периоде не удалось выполнить план сбережений или обязательных трат. В следующем периоде сначала отложи монеты на морковку и в цель!';
      }

      const summary: PeriodSummary = {
        periodNumber: pNum,
        plan,
        fact,
        variance,
        disciplined,
        bonusAwarded: bonus,
        resultDescription: disciplined
          ? 'Отличный период! План выполнен, Финни сыт, а мечта стала ближе.'
          : 'Период завершён. Обрати внимание на соблюдение обязательных расходов.',
        petStateDelta: {
          satiety: consequences.satietyDelta,
          mood: consequences.moodDelta,
        },
        petStageBefore: stageBefore,
        petStageAfter: stageAfter,
        teachableMoment,
      };

      this.state.periodHistory.push(summary);

      // Award baseline period income + discipline bonus
      const totalAward = 20 + bonus;
      this.state.balance += totalAward;
      this.recordIncome(
        totalAward,
        `period_award:${pNum}`,
        `Доход периода ${pNum + 1} (база 20 + бонус ${bonus})`,
        'budget'
      );

      // Emit reaction on period completion or evolution
      if (stageAfter > stageBefore) {
        this.emitReaction('stage_evolution', `Новая стадия развития: ${stageAfter}! 🎉`);
      } else {
        this.emitReaction('period_finish', `Период ${pNum} успешно завершён!`);
      }

      // Start next period
      this.startPeriod(pNum + 1);

      return { success: true, data: summary };
    });
  }

  // 13. CALCULATE CONSEQUENCES
  public calculateConsequences(): { satietyDelta: number; moodDelta: number; advice: string } {
    let satietyDelta = 0;
    let moodDelta = 0;
    let advice = 'Все показатели в норме.';

    // Hunger consequences
    if (this.state.actualMandatory === 0) {
      satietyDelta = -15;
      moodDelta = -10;
      this.state.petState.satiety = Math.max(10, this.state.petState.satiety + satietyDelta);
      this.state.petState.mood = Math.max(10, this.state.petState.mood + moodDelta);
      advice = 'Финни проголодался без обязательных покупок еды! Обязательно покорми его.';
    } else {
      satietyDelta = 10;
      moodDelta = 10;
      this.state.petState.satiety = Math.min(100, this.state.petState.satiety + satietyDelta);
      this.state.petState.mood = Math.min(100, this.state.petState.mood + moodDelta);
      advice = 'Финни сыт и доволен соблюдением режима дня.';
    }

    return { satietyDelta, moodDelta, advice };
  }

  // 14. UPDATE PET STATE
  public updatePetState(delta: Partial<PetState>): EngineResult<void> {
    return this.runTransaction(() => {
      if (delta.satiety !== undefined) {
        this.state.petState.satiety = Math.min(100, Math.max(0, delta.satiety));
      }
      if (delta.mood !== undefined) {
        this.state.petState.mood = Math.min(100, Math.max(0, delta.mood));
      }
      if (delta.energy !== undefined) {
        this.state.petState.energy = Math.min(100, Math.max(0, delta.energy));
      }
      if (delta.statusText) {
        this.state.petState.statusText = delta.statusText;
      }
      return { success: true };
    });
  }

  // 15. UPDATE PET GROWTH
  public updatePetGrowth(): EngineResult<PetStage> {
    return this.runTransaction(() => {
      let stage: PetStage = 1;
      if (this.state.currentPeriod >= 5) {
        stage = 3; // Мастер-иллюстратор
      } else if (this.state.currentPeriod >= 3) {
        stage = 2; // Юный мастер
      } else {
        stage = 1; // Малыш
      }

      // Also evaluate multi-period criteria from PetDevelopmentEngine
      const devEval = PetDevelopmentEngine.evaluateStage(this.state);
      if (devEval.currentStage > stage) {
        stage = devEval.currentStage;
      }

      const prevStage = this.state.petDevelopmentStage;
      this.state.petDevelopmentStage = stage;
      this.state.playerProfile.stage = stage;

      if (stage > prevStage) {
        this.emitReaction('stage_evolution', devEval.celebrationText || `Новая стадия развития: ${stage}! 🎉`);
      }

      return { success: true, data: stage };
    });
  }

  // 16. RESET PROFILE
  public resetProfile(): EngineResult<void> {
    this.state = createDefaultEngineState();
    return { success: true };
  }

  // 17. DELETE PROFILE
  public deleteProfile(): EngineResult<void> {
    this.state = createDefaultEngineState();
    this.state.playerProfile.playerName = '';
    this.state.playerProfile.petName = '';
    this.state.playerProfile.onboardingCompleted = false;
    return { success: true };
  }

  // --- HELPERS ---
  public getCurrentGoal(): FinancialGoal | undefined {
    return this.state.goals.find((g) => g.id === this.state.currentGoalId) || this.state.goals[0];
  }

  private recordIncome(amount: number, source: string, title: string, category: string) {
    const tx: GameTransaction = {
      id: `tx_inc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      period: this.state.currentPeriod,
      type: 'income',
      title,
      amount,
      source,
      category,
    };
    this.state.incomeHistory.unshift(tx);
    // Keep max 60 records
    if (this.state.incomeHistory.length > 60) {
      this.state.incomeHistory = this.state.incomeHistory.slice(0, 60);
    }
  }

  private updateLiteracyLevel() {
    const completed = this.state.educationalProgress.totalTasksCompleted;
    if (completed >= 6) {
      this.state.educationalProgress.literacyLevel = 'Эксперт';
    } else if (completed >= 4) {
      this.state.educationalProgress.literacyLevel = 'Практик';
    } else if (completed >= 2) {
      this.state.educationalProgress.literacyLevel = 'Ученик';
    } else {
      this.state.educationalProgress.literacyLevel = 'Новичок';
    }
  }
}
