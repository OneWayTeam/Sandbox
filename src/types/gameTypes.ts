export type PetStage = 1 | 2 | 3; // 1: Малыш-новичок, 2: Юный мастер, 3: Мастер-иллюстратор

export interface PetAppearance {
  sweaterColor: 'green' | 'blue' | 'red';
  accessory: 'clover' | 'star' | 'brush';
  hat: 'none' | 'beret' | 'glasses';
}

export interface PetState {
  satiety: number;   // 0..100 (Сытость - зависит от обязательных расходов)
  mood: number;      // 0..100 (Настроение - зависит от желаемых покупок и поглаживаний)
  energy: number;    // 0..100 (Энергия)
  statusText: string;
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
  reward: number;
  options: TaskOption[];
  completed: boolean;
  userChoiceId?: string;
}

export type ItemType = 'mandatory' | 'discretionary';
export type ItemCategory = 'food' | 'care' | 'art' | 'clothes' | 'furniture';

export interface ShopItem {
  id: string;
  title: string;
  type: ItemType; // 'mandatory' (еда, уход) или 'discretionary' (желаемое)
  category: ItemCategory;
  price: number;
  iconName: string;
  satietyBoost: number;
  moodBoost: number;
  description: string;
}

export interface PeriodSummary {
  periodNumber: number;
  plan: BudgetPlan;
  fact: BudgetFact;
  disciplined: boolean;
  bonusAwarded: number;
}
