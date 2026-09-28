import { PetMoodState } from '../types/gameTypes';

export interface PetMoodEvaluation {
  moodState: PetMoodState;
  statusText: string;
  explanation: string;
  actionAdvice: string;
  isTemporary: true;
}

export interface StateEvaluationContext {
  satiety: number;
  mood: number;
  currentPeriod: number;
  actualMandatory: number;
  plannedMandatory: number;
  actualSavings: number;
  isBudgetApproved: boolean;
  tasksCompletedInPeriod: number;
  activeGoalPercent?: number;
  lastActionType?: string;
  petName?: string;
}

/**
 * Reversible, child-friendly, non-punitive pet state manager.
 * Strict principle: NO death, NO illness, NO injury, NO fear, NO shame.
 * Every state is temporary, clear, and provides a constructive recovery action.
 */
export class PetStateManager {
  public static evaluate(ctx: StateEvaluationContext): PetMoodEvaluation {
    const {
      satiety,
      mood,
      actualMandatory,
      plannedMandatory,
      actualSavings,
      tasksCompletedInPeriod,
      activeGoalPercent = 0,
      lastActionType,
      petName = 'Питомец',
    } = ctx;

    const name = petName.trim() || 'Питомец';

    // 1. EXCITED: Big financial progress or recent saving / trophy
    if (
      lastActionType === 'savings' ||
      lastActionType === 'stage_evolution' ||
      activeGoalPercent >= 50 ||
      (actualSavings > 0 && tasksCompletedInPeriod >= 2)
    ) {
      return {
        moodState: 'excited',
        statusText: `${name} полон вдохновения и энергии!`,
        explanation: `Мечта становится всё ближе! ${name} вдохновлен твоими финансовыми успехами.`,
        actionAdvice: 'Продолжай двигаться к цели — ты отлично управляешь монетами!',
        isTemporary: true,
      };
    }

    // 2. WORRIED: Non-punitive temporary state when food/care isn't closed or deficit occurred
    if (satiety < 35 || (plannedMandatory > 0 && actualMandatory === 0 && satiety < 50)) {
      return {
        moodState: 'worried',
        statusText: `${name} проголодался и ждёт обеда.`,
        explanation:
          `В этом периоде обязательные траты ещё не закрыты. ${name} нужно полезное подкрепление.`,
        actionAdvice:
          'Загляни в лавку и закрой обязательные нужды (сладкую морковку или витаминный сбор), либо проверь план бюджета.',
        isTemporary: true,
      };
    }

    // 3. TIRED: Exhaustion after solving many tasks without rest
    if (tasksCompletedInPeriod >= 3 && mood < 40) {
      return {
        moodState: 'tired',
        statusText: `${name} немного устал после заданий.`,
        explanation:
          `${name} много трудился в парке заданий. Мозгу тоже нужен отдых и вкусное яблоко!`,
        actionAdvice:
          `Погладь питомца в комнате или заверши период, чтобы ${name} набрался сил.`,
        isTemporary: true,
      };
    }

    // 4. HAPPY: Well-fed, disciplined, good mood
    if (satiety >= 60 && mood >= 50) {
      return {
        moodState: 'happy',
        statusText: `${name} сыт, доволен и весело машет лапкой!`,
        explanation:
          `Ты отлично позаботился о важных покупках — ${name} сыт, в комнате тепло и уютно.`,
        actionAdvice:
          'Всё идет замечательно. Можно отложить пару монет в золотой сейф или присмотреть одежду.',
        isTemporary: true,
      };
    }

    // 5. CALM: Stable baseline state
    return {
      moodState: 'calm',
      statusText: 'Всё спокойно и идёт по плану.',
      explanation:
        `Бюджет под контролем. ${name} готов к новым урокам рисования и финансовым открытиям.`,
      actionAdvice:
        'Проверь план на текущий период и сделай шаги к своей мечте.',
      isTemporary: true,
    };
  }
}
