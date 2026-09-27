export interface EducationalGoal {
  id: string;
  name: string;
  title: string; // alias for UI compatibility
  totalCost: number;
  description: string;
  category: string;
  iconName: string;
  visualAsset: string;
  savedAmount: number;
  progressPercent: number;
  isCompleted: boolean;
  completedAtPeriod?: number;
}

export const EDUCATIONAL_GOALS: EducationalGoal[] = [
  {
    id: 'goal_paints',
    name: 'Набор красок и холстов',
    title: 'Набор красок и холстов',
    category: 'Творчество и дизайн',
    totalCost: 160,
    savedAmount: 35,
    progressPercent: 22,
    description:
      'Мечта о собственных качественных красках и альбомах, чтобы создавать яркие рисунки и подарки друзьям!',
    iconName: 'palette',
    visualAsset: 'gold_bars',
    isCompleted: false,
  },
  {
    id: 'goal_bicycle',
    name: 'Скоростной велосипед',
    title: 'Скоростной велосипед',
    category: 'Спорт и прогулки',
    totalCost: 180,
    savedAmount: 0,
    progressPercent: 0,
    description:
      'Надёжный двухколёсный друг со звонком и фонариком для весёлых поездок по парковым дорожкам!',
    iconName: 'trophy',
    visualAsset: 'gold_bars',
    isCompleted: false,
  },
  {
    id: 'goal_telescope',
    name: 'Звёздный телескоп',
    title: 'Звёздный телескоп',
    category: 'Наука и космос',
    totalCost: 150,
    savedAmount: 0,
    progressPercent: 0,
    description:
      'Оптический прибор для наблюдения за кратерами Луны, планетами и далёкими созвездиями на ночном небе!',
    iconName: 'target',
    visualAsset: 'gold_bars',
    isCompleted: false,
  },
  {
    id: 'goal_robot',
    name: 'Конструктор роботов',
    title: 'Конструктор роботов',
    category: 'Технологии и логика',
    totalCost: 130,
    savedAmount: 0,
    progressPercent: 0,
    description:
      'Электронный набор с моторчиками и датчиками, из которого можно собрать своего умного робота-помощника!',
    iconName: 'target',
    visualAsset: 'gold_bars',
    isCompleted: false,
  },
  {
    id: 'goal_easel',
    name: 'Деревянный мольберт',
    title: 'Деревянный мольберт',
    category: 'Уютная мастерская',
    totalCost: 250,
    savedAmount: 0,
    progressPercent: 0,
    description:
      'Устойчивый деревянный мольберт со специальной полочкой для кистей, маркеров и чертежей.',
    iconName: 'easel',
    visualAsset: 'easel',
    isCompleted: false,
  },
  {
    id: 'goal_exhibition',
    name: 'Поездка в музей открытий',
    title: 'Поездка в музей открытий',
    category: 'Большая мечта',
    totalCost: 400,
    savedAmount: 0,
    progressPercent: 0,
    description:
      'Увлекательное путешествие в интерактивный научный парк с интерактивными экспонатами и планетарием!',
    iconName: 'trophy',
    visualAsset: 'trophy',
    isCompleted: false,
  },
];

export interface GoalPeriodEstimate {
  estimatedPeriods: number | null;
  displayText: string;
  isReliable: boolean;
  explanation: string;
}

/**
 * Honest, data-driven calculation of periods remaining to reach a goal.
 * Rule: never show false precision when there is no empirical data!
 */
export function calculateGoalEstimatedPeriods(
  goal: { totalCost: number; savedAmount: number },
  savingsHistory: number[],
  currentPlannedSavings?: number
): GoalPeriodEstimate {
  const remaining = Math.max(0, goal.totalCost - goal.savedAmount);

  // 1. Goal is already fulfilled
  if (remaining === 0) {
    return {
      estimatedPeriods: 0,
      displayText: 'Цель достигнута!',
      isReliable: true,
      explanation: 'Все средства собраны, можно праздновать исполнение мечты!',
    };
  }

  // 2. Extract actual positive savings contributions from past periods
  const positiveHistory = savingsHistory.filter((s) => typeof s === 'number' && s > 0);

  let effectiveRate = 0;
  let calculationSource = '';

  if (positiveHistory.length >= 1) {
    // Average of actual historical savings
    const sum = positiveHistory.reduce((acc, val) => acc + val, 0);
    effectiveRate = sum / positiveHistory.length;
    calculationSource = `на основе среднего отчисления (~${Math.round(effectiveRate)} монет/период)`;
  } else if (typeof currentPlannedSavings === 'number' && currentPlannedSavings > 0) {
    // Current approved budget plan
    effectiveRate = currentPlannedSavings;
    calculationSource = `по плану бюджета (${effectiveRate} монет/период)`;
  }

  // 3. If no actual or planned savings rate is established, DO NOT fake a number!
  if (effectiveRate <= 0) {
    return {
      estimatedPeriods: null,
      displayText: 'Расчёт появится после первых накоплений',
      isReliable: false,
      explanation:
        'Срок зависит от твоих решений! Отложи монеты в бюджет или сейф, чтобы увидеть точный прогноз.',
    };
  }

  const periods = Math.ceil(remaining / effectiveRate);
  const periodWord =
    periods % 10 === 1 && periods % 100 !== 11
      ? 'период'
      : [2, 3, 4].includes(periods % 10) && ![12, 13, 14].includes(periods % 100)
      ? 'периода'
      : 'периодов';

  return {
    estimatedPeriods: periods,
    displayText: `~${periods} ${periodWord} (${calculationSource})`,
    isReliable: true,
    explanation: `При сохранении темпа накоплений цель будет закрыта через ${periods} ${periodWord}.`,
  };
}
