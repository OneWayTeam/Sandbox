import { FinancialGoal, FinancialTask, ShopItem } from '../types/gameTypes';
import {
  EDUCATIONAL_GOALS,
  EDUCATIONAL_SHOP_ITEMS,
  EDUCATIONAL_TASKS,
  CONTENT_VALIDATION_REPORT,
  calculateGoalEstimatedPeriods,
} from '../content';

// 1. Финансовые цели (data-driven из content/goalsContent.ts)
export const INITIAL_GOALS: FinancialGoal[] = EDUCATIONAL_GOALS as any;

// 2. Каталог покупок (data-driven из content/shopContent.ts: 12 позиций, обязательные и необязательные)
export const INITIAL_SHOP_ITEMS: ShopItem[] = EDUCATIONAL_SHOP_ITEMS as any;

// 3. Финансовые задания (data-driven из content/tasksContent.ts: 6 ситуаций по 3 темам)
export const INITIAL_TASKS: FinancialTask[] = EDUCATIONAL_TASKS as any;

// 4. Описания стадий роста питомца (не менее 3 по ТЗ 2.6)
export const PET_STAGES = [
  {
    stage: 1,
    title: 'Малыш-исследователь',
    subtitle: 'Учится отличать обязательные траты от желаний',
    minPeriods: 1,
    bonuses: '+5 монет к доходу периода',
  },
  {
    stage: 2,
    title: 'Юный мастер',
    subtitle: 'Уверенно планирует бюджет и пополняет копилку',
    minPeriods: 3,
    bonuses: '+10 монет к доходу периода, скидка 10% в лавке',
  },
  {
    stage: 3,
    title: 'Мастер-иллюстратор',
    subtitle: 'Финансово грамотный компаньон с собственной студией',
    minPeriods: 5,
    bonuses: '+20 монет к доходу периода, статус Эксперта',
  },
];

// 5. Образовательный справочник для детей и родителей (ТЗ 2.5.11 и 2.5.12)
export const FINANCIAL_TERMS = [
  {
    term: 'Обязательные расходы',
    childDesc: 'То, без чего нельзя обойтись каждый день: полезная еда, забота о здоровье и тёплый дом.',
    parentNote: 'Основа личного бюджета (компетенция 1-2 Единой рамки).',
  },
  {
    term: 'Необязательные расходы (желания)',
    childDesc: 'Приятные покупки для радости и настроения: игрушки, сладости, украшения. Их можно отложить.',
    parentNote: 'Развивает критическое мышление и отложенное вознаграждение.',
  },
  {
    term: 'Сбережения и Копилка',
    childDesc: 'Часть денег, которую мы прячем в надёжное место, чтобы накопить на большую мечту.',
    parentNote: 'Формирует культуру целеполагания и финансовой подушки безопасности.',
  },
  {
    term: 'План и Факт',
    childDesc: 'План — это как мы договорились потратить монеты. Факт — то, как мы их потратили на самом деле.',
    parentNote: 'Инструмент самоконтроля и анализа принятых решений.',
  },
];

export { CONTENT_VALIDATION_REPORT, calculateGoalEstimatedPeriods };
