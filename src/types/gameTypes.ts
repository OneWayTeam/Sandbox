export type PetStage = 1 | 2 | 3; // 1: Малыш-новичок, 2: Юный мастер, 3: Мастер-иллюстратор

export type CharacterSpeciesId =
  | 'raccoon'
  | 'fox'
  | 'cat'
  | 'panda'
  | 'capybara'
  | 'rabbit'
  | 'bear'
  | 'dog'
  | 'otter';

export interface PetAppearance {
  characterId?: CharacterSpeciesId;
  sweaterColor: 'green' | 'blue' | 'red';
  accessory: 'clover' | 'star' | 'brush';
  hat: 'none' | 'beret' | 'glasses';
}

export type PetMoodState = 'happy' | 'calm' | 'worried' | 'excited' | 'tired';

export type PetReactionType =
  | 'income'
  | 'purchase'
  | 'savings'
  | 'task_completed'
  | 'period_finish'
  | 'stage_evolution'
  | 'tap';

export interface PetReactionEvent {
  type: PetReactionType;
  message: string;
  icon?: string;
  timestamp: number;
}

export interface PetState {
  satiety: number;   // 0..100 (Сытость - зависит от обязательных расходов)
  mood: number;      // 0..100 (Настроение - зависит от желаемых покупок и поглаживаний)
  energy: number;    // 0..100 (Энергия)
  statusText: string;
  moodState?: PetMoodState;
  explanation?: string;
  lastReaction?: PetReactionEvent;
}

export interface GameSettings {
  animationsEnabled: boolean;
}

export interface UserProfile {
  petName: string;
  playerName: string;
  stage: PetStage;
  appearance: PetAppearance;
  onboardingCompleted: boolean;
}

export interface BudgetPlan {
  mandatory: number;     // Обязательные расходы (еда, уход)
  discretionary: number; // Необязательные расходы (развлечения, игрушки)
  savings: number;       // Накопления в копилку цели
  isApproved: boolean;   // Утверждён ли план на текущий период
}

export interface BudgetFact {
  mandatory: number;
  discretionary: number;
  savings: number;
}

export interface FinancialGoal {
  id: string;
  title: string;
  category: string;
  totalCost: number;
  savedAmount: number;
  description: string;
  iconName: string;
}

export type TaskTheme = 'budget' | 'savings' | 'payments';

export interface TaskOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  rewardChange: number;
  moodChange: number;
  satietyChange?: number;
}

export interface FinancialTask {
  id: string;
  theme: TaskTheme;
  themeTitle: string;
  title: string;
  scenario: string;
  situation?: string;
  availableResources?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  unlockRule?: { minPeriod?: number; minStage?: number; prerequisiteTaskId?: string };
  educationalExplanation?: string;
  topic?: TaskTheme;
  topicTitle?: string;
  reward: number;
  options: TaskOption[];
  completed: boolean;
  userChoiceId?: string;
}

export type ItemType = 'mandatory' | 'discretionary';
export type ItemCategory =
  | 'food'
  | 'care'
  | 'needs'
  | 'toy'
  | 'decoration'
  | 'accessory'
  | 'entertainment'
  | 'art'
  | 'clothes'
  | 'furniture';

export interface ShopItem {
  id: string;
  title: string;
  name?: string;
  type: ItemType; // 'mandatory' (еда, уход) или 'discretionary' (желаемое)
  category: ItemCategory;
  categoryLabel?: string;
  price: number;
  iconName: string;
  satietyBoost: number;
  moodBoost: number;
  description: string;
  availability?: boolean;
}

export interface PeriodVariance {
  mandatory: number;     // fact.mandatory - plan.mandatory
  discretionary: number; // fact.discretionary - plan.discretionary
  savings: number;       // fact.savings - plan.savings
}

export interface PeriodSummary {
  periodNumber: number;
  plan: BudgetPlan;
  fact: BudgetFact;
  variance: PeriodVariance;
  disciplined: boolean;
  bonusAwarded: number;
  resultDescription: string;
  petStateDelta: {
    satiety: number;
    mood: number;
  };
  petStageBefore: PetStage;
  petStageAfter: PetStage;
  teachableMoment?: string;
}

export interface EducationalProgress {
  totalTasksCompleted: number;
  correctAnswersCount: number;
  themesCompleted: string[];
  achievementsUnlocked: string[];
  literacyLevel: 'Новичок' | 'Ученик' | 'Практик' | 'Эксперт';
}

export type TransactionType =
  | 'income'
  | 'mandatory'
  | 'discretionary'
  | 'savings_deposit'
  | 'savings_withdraw'
  | 'task_reward'
  | 'parent_bonus'
  | 'refund';

export interface GameTransaction {
  id: string;
  timestamp: number;
  period: number;
  type: TransactionType;
  title: string;
  amount: number; // positive (+) for income/rewards/refunds, negative (-) for expenses/deposits
  source: string; // clear provenance of currency change (e.g. 'budget_allowance', 'task:task_budget_1', 'parent_bonus', 'shop:food_apple')
  category?: string;
}

export interface GameAchievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  rewardCoins: number;
}

