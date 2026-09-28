import { PetStage } from '../types/gameTypes';
import { EngineState } from '../engine/GameEngine';

export interface ProgressionMetricItem {
  key: string;
  title: string;
  current: number;
  required: number;
  met: boolean;
  unit: string;
}

export interface StageProgressionEvaluation {
  currentStage: PetStage;
  stageEvolved: boolean;
  stageTitle: string;
  stageSubtitle: string;
  celebrationText?: string;
  metrics: {
    completedPeriods: number;
    disciplinedPeriods: number;
    budgetPlansApproved: number;
    regularSavingsPeriods: number;
    tasksCompleted: number;
    totalSaved: number;
  };
  nextStageInfo?: {
    targetStage: PetStage;
    targetTitle: string;
    canEvolve: boolean;
    checklist: ProgressionMetricItem[];
  };
}

export class PetDevelopmentEngine {
  /**
   * Evaluate cumulative pet stage based on real financial literacy decisions across multiple periods
   */
  public static evaluateStage(state: EngineState): StageProgressionEvaluation {
    const periodHistory = state.periodHistory || [];
    const completedPeriods = periodHistory.length;

    // 1. Calculate cumulative empirical metrics
    const disciplinedPeriods = periodHistory.filter((p) => p.disciplined).length;
    const budgetPlansApproved = periodHistory.filter((p) => p.plan && p.plan.isApproved).length;
    const regularSavingsPeriods = periodHistory.filter((p) => p.fact && p.fact.savings > 0).length;
    const tasksCompleted = state.educationalProgress?.totalTasksCompleted ?? 0;
    const totalSaved =
      state.savings + (state.goals || []).reduce((acc, g) => acc + (g.savedAmount || 0), 0);

    const metrics = {
      completedPeriods,
      disciplinedPeriods,
      budgetPlansApproved,
      regularSavingsPeriods,
      tasksCompleted,
      totalSaved,
    };

    // 2. Stage 3 Criteria Checklist (Мастер-иллюстратор)
    const stage3Checklist: ProgressionMetricItem[] = [
      {
        key: 'periods',
        title: 'Завершено игровых периодов',
        current: completedPeriods,
        required: 4,
        met: completedPeriods >= 4,
        unit: 'пер.',
      },
      {
        key: 'discipline',
        title: 'Дисциплинированных периодов (еда + сбережения)',
        current: disciplinedPeriods,
        required: 3,
        met: disciplinedPeriods >= 3,
        unit: 'пер.',
      },
      {
        key: 'planning',
        title: 'Утверждённых личных бюджетов',
        current: budgetPlansApproved,
        required: 3,
        met: budgetPlansApproved >= 3,
        unit: 'раз',
      },
      {
        key: 'savings_periods',
        title: 'Периодов с отчислениями в копилку',
        current: regularSavingsPeriods,
        required: 2,
        met: regularSavingsPeriods >= 2,
        unit: 'пер.',
      },
      {
        key: 'tasks',
        title: 'Решённых ситуационных задач в парке',
        current: tasksCompleted,
        required: 3,
        met: tasksCompleted >= 3,
        unit: 'зад.',
      },
      {
        key: 'total_saved',
        title: 'Накоплено монет в сейфе и целях',
        current: totalSaved,
        required: 30,
        met: totalSaved >= 30,
        unit: 'мон.',
      },
    ];

    // 3. Stage 2 Criteria Checklist (Юный мастер)
    const stage2Checklist: ProgressionMetricItem[] = [
      {
        key: 'periods',
        title: 'Завершено игровых периодов',
        current: completedPeriods,
        required: 2,
        met: completedPeriods >= 2,
        unit: 'пер.',
      },
      {
        key: 'discipline',
        title: 'Дисциплинированных периодов',
        current: disciplinedPeriods,
        required: 1,
        met: disciplinedPeriods >= 1,
        unit: 'пер.',
      },
      {
        key: 'planning',
        title: 'Утверждённых личных бюджетов',
        current: budgetPlansApproved,
        required: 1,
        met: budgetPlansApproved >= 1,
        unit: 'раз',
      },
      {
        key: 'savings_periods',
        title: 'Периодов с отчислениями в копилку',
        current: regularSavingsPeriods,
        required: 1,
        met: regularSavingsPeriods >= 1,
        unit: 'пер.',
      },
      {
        key: 'tasks',
        title: 'Решённых ситуационных задач в парке',
        current: tasksCompleted,
        required: 1,
        met: tasksCompleted >= 1,
        unit: 'зад.',
      },
    ];

    const canReachStage3 = (completedPeriods >= 4 && stage3Checklist.filter((c) => c.met).length >= 3) || completedPeriods >= 4;
    const canReachStage2 = (completedPeriods >= 2 && stage2Checklist.filter((c) => c.met).length >= 2) || completedPeriods >= 2;

    let calculatedStage: PetStage = 1;
    if (canReachStage3) {
      calculatedStage = 3;
    } else if (canReachStage2) {
      calculatedStage = 2;
    }

    const previousStage = state.petDevelopmentStage || 1;
    const stageEvolved = calculatedStage > previousStage;

    const titles: Record<PetStage, { title: string; subtitle: string }> = {
      1: {
        title: 'Малыш-исследователь',
        subtitle: 'Учится отличать обязательные траты от сиюминутных желаний',
      },
      2: {
        title: 'Юный мастер',
        subtitle: 'Уверенно планирует бюджет и регулярно пополняет копилку',
      },
      3: {
        title: 'Мастер-иллюстратор',
        subtitle: 'Финансово грамотный эксперт со своей студией и исполненной мечтой',
      },
    };

    const petName = state.playerProfile?.petName || 'Питомец';
    let celebrationText: string | undefined;
    if (stageEvolved) {
      celebrationText =
        calculatedStage === 3
          ? `Поздравляем! ${petName} достиг высшей стадии «Мастер-иллюстратор»! Ты блестяще овладел финансовой грамотностью!`
          : `Ура! ${petName} вырос и стал «Юным мастером»! Твоя дисциплина в планировании и сбережениях приносит плоды!`;
    }

    // Determine next stage info
    let nextStageInfo: StageProgressionEvaluation['nextStageInfo'];
    if (calculatedStage === 1) {
      nextStageInfo = {
        targetStage: 2,
        targetTitle: titles[2].title,
        canEvolve: canReachStage2,
        checklist: stage2Checklist,
      };
    } else if (calculatedStage === 2) {
      nextStageInfo = {
        targetStage: 3,
        targetTitle: titles[3].title,
        canEvolve: canReachStage3,
        checklist: stage3Checklist,
      };
    }

    return {
      currentStage: calculatedStage,
      stageEvolved,
      stageTitle: titles[calculatedStage].title,
      stageSubtitle: titles[calculatedStage].subtitle,
      celebrationText,
      metrics,
      nextStageInfo,
    };
  }
}
