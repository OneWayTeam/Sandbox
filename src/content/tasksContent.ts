import { TaskTheme } from '../types/gameTypes';

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface TaskConsequence {
  balanceChange: number;
  savingsChange?: number;
  satietyChange?: number;
  moodChange?: number;
  explanation: string;
  nextStepRecommendation: string;
}

export interface TaskAction {
  id: string;
  text: string;
  isCorrect: boolean;
  consequence: TaskConsequence;
}

export interface TaskUnlockRule {
  minPeriod?: number;
  minStage?: number;
  prerequisiteTaskId?: string;
}

export interface EducationalTask {
  id: string;
  topic: TaskTheme;
  topicTitle: string;
  title: string;
  situation: string;
  availableResources: string;
  difficulty: TaskDifficulty;
  reward: number;
  unlockRule: TaskUnlockRule;
  educationalExplanation: string;
  possibleActions: TaskAction[];
  // Compatibility fields for UI and Engine
  theme: TaskTheme;
  scenario: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
    rewardChange: number;
    moodChange: number;
    satietyChange?: number;
  }[];
  completed: boolean;
  userChoiceId?: string;
}

export const EDUCATIONAL_TASKS: EducationalTask[] = [
  // --- ТЕМА 1: ПЛАНИРОВАНИЕ БЮДЖЕТА ---
  {
    id: 'task_budget_1',
    topic: 'budget',
    theme: 'budget',
    topicTitle: 'Планирование бюджета',
    title: 'Карманные деньги и выбор',
    situation:
      'Финни получил 30 монет на неделю. Питомцу обязательно нужна полезная еда (10 монет), а в лавке манит красивый значок-игрушка за 20 монет.',
    scenario:
      'Финни получил 30 монет на неделю. Питомцу обязательно нужна полезная еда (10 монет), а в лавке манит красивый значок-игрушка за 20 монет. Как поступить?',
    availableResources: 'В кошельке: 30 монет. В копилке: 0 монет.',
    difficulty: 'easy',
    unlockRule: { minPeriod: 1 },
    reward: 10,
    educationalExplanation:
      'Обязательные расходы (еда, здоровье) планируются в первую очередь! На желания тратят только то, что осталось после главного.',
    possibleActions: [
      {
        id: 'tb1_opt1',
        text: 'Сначала отложить 10 монет на еду, 10 монет в копилку, а значок купить позже',
        isCorrect: true,
        consequence: {
          balanceChange: 10,
          savingsChange: 0,
          satietyChange: 25,
          moodChange: 20,
          explanation:
            'Отлично! Обязательные расходы закрыты, Финни сыт, а копилка начала расти.',
          nextStepRecommendation:
            'Проверь бюджет на период: сначала всегда планируй еду и уход!',
        },
      },
      {
        id: 'tb1_opt2',
        text: 'Потратить 20 монет сразу на значок, а на еду оставить то, что останется',
        isCorrect: false,
        consequence: {
          balanceChange: 2,
          savingsChange: 0,
          satietyChange: -15,
          moodChange: -10,
          explanation:
            'Осторожно! Значок порадовал минуту, но на полноценный обед денег не хватило — Финни остался голодным.',
          nextStepRecommendation:
            'Загляни в лавку и купи морковку, чтобы восстановить силы питомца.',
        },
      },
    ],
    options: [
      {
        id: 'tb1_opt1',
        text: 'Сначала отложить 10 монет на еду, 10 монет в копилку, а значок купить позже',
        isCorrect: true,
        explanation:
          'Отлично! Обязательные расходы закрыты, Финни сыт, а копилка начала расти.',
        rewardChange: 10,
        moodChange: 20,
        satietyChange: 25,
      },
      {
        id: 'tb1_opt2',
        text: 'Потратить 20 монет сразу на значок, а на еду оставить то, что останется',
        isCorrect: false,
        explanation:
          'Осторожно! Значок порадовал минуту, но на полноценный обед денег не хватило — Финни остался голодным.',
        rewardChange: 2,
        moodChange: -10,
        satietyChange: -15,
      },
    ],
    completed: false,
  },
  {
    id: 'task_budget_2',
    topic: 'budget',
    theme: 'budget',
    topicTitle: 'Планирование бюджета',
    title: 'Поход в художественный магазин',
    situation:
      'У Финни есть 25 монет. Для завершения картины ему необходима чёрная краска (8 монет). Также на витрине лежит блестящая наклейка за 20 монет.',
    scenario:
      'У Финни есть 25 монет. Для завершения картины ему необходима чёрная краска (8 монет). Также на витрине лежит блестящая наклейка за 20 монет.',
    availableResources: 'В кошельке: 25 монет. Нужна краска: 8 монет.',
    difficulty: 'medium',
    unlockRule: { minPeriod: 1 },
    reward: 10,
    educationalExplanation:
      'Сначала закрывай необходимые для дела материалы. Спонтанные покупки наклеек оставляют важные дела незавершёнными.',
    possibleActions: [
      {
        id: 'tb2_opt1',
        text: 'Купить нужную краску за 8 монет, а 17 монет сберечь на будущие материалы',
        isCorrect: true,
        consequence: {
          balanceChange: 10,
          satietyChange: 0,
          moodChange: 25,
          explanation:
            'Правильное решение! Картина успешно завершена, а остаток спасён от сиюминутных трат.',
          nextStepRecommendation:
            'Накопленные 17 монет можно отправить в сейф для покупки мольберта.',
        },
      },
      {
        id: 'tb2_opt2',
        text: 'Купить наклейку за 20 монет, а краску пока не покупать',
        isCorrect: false,
        consequence: {
          balanceChange: 2,
          satietyChange: 0,
          moodChange: -5,
          explanation:
            'Картина осталась незаконченной. Наклейка быстро наскучила, а важная цель так и не достигнута.',
          nextStepRecommendation:
            'Помни: полезные инструменты важнее сиюминутных наклеек.',
        },
      },
    ],
    options: [
      {
        id: 'tb2_opt1',
        text: 'Купить нужную краску за 8 монет, а 17 монет сберечь на будущие материалы',
        isCorrect: true,
        explanation:
          'Правильное решение! Картина успешно завершена, а остаток спасён от сиюминутных трат.',
        rewardChange: 10,
        moodChange: 25,
      },
      {
        id: 'tb2_opt2',
        text: 'Купить наклейку за 20 монет, а краску пока не покупать',
        isCorrect: false,
        explanation:
          'Картина осталась незаконченной. Наклейка быстро наскучила, а важная цель так и не достигнута.',
        rewardChange: 2,
        moodChange: -5,
      },
    ],
    completed: false,
  },

  // --- ТЕМА 2: ФОРМИРОВАНИЕ СБЕРЕЖЕНИЙ ---
  {
    id: 'task_savings_1',
    topic: 'savings',
    theme: 'savings',
    topicTitle: 'Формирование сбережений',
    title: 'Копилка мечты: шаг за шагом',
    situation:
      'Финни мечтает накопить на набор красок (160 монет). Сейчас у него появилось 15 свободных монет. Как лучше поступить?',
    scenario:
      'Финни мечтает накопить на набор красок (160 монет). Сейчас у него есть 15 свободных монет. Что с ними сделать?',
    availableResources: 'Свободно: 15 монет. Цель: 160 монет.',
    difficulty: 'easy',
    unlockRule: { minPeriod: 1 },
    reward: 10,
    educationalExplanation:
      'Регулярные небольшие переводы в сейф — главный закон накоплений. Так даже большая мечта становится ближе с каждым днём.',
    possibleActions: [
      {
        id: 'ts1_opt1',
        text: 'Отправить 10 монет в копилку цели, а 5 оставить на мелкие расходы',
        isCorrect: true,
        consequence: {
          balanceChange: 10,
          savingsChange: 10,
          satietyChange: 0,
          moodChange: 20,
          explanation:
            'Замечательно! Полоска цели уверенно выросла, и Финни гордится собой.',
          nextStepRecommendation:
            'Зайди в раздел «Сейф» и проверь новый процент готовности цели!',
        },
      },
      {
        id: 'ts1_opt2',
        text: 'Купить три сладких леденца прямо сейчас, ведь цель ещё далеко',
        isCorrect: false,
        consequence: {
          balanceChange: 2,
          savingsChange: 0,
          satietyChange: 0,
          moodChange: 5,
          explanation:
            'Леденцы быстро закончились, а цель так и осталась далёкой. Без дисциплины мечта не приблизится.',
          nextStepRecommendation:
            'Попробуй правило: откладывай хотя бы монетку с каждого заработка.',
        },
      },
    ],
    options: [
      {
        id: 'ts1_opt1',
        text: 'Отправить 10 монет в копилку цели, а 5 оставить на мелкие расходы',
        isCorrect: true,
        explanation:
          'Замечательно! Регулярные отчисления в копилку — главный секрет достижения мечты.',
        rewardChange: 10,
        moodChange: 20,
      },
      {
        id: 'ts1_opt2',
        text: 'Купить три сладких леденца прямо сейчас, ведь цель ещё далеко',
        isCorrect: false,
        explanation:
          'Если тратить все деньги на сладости, цель будет откладываться бесконечно.',
        rewardChange: 2,
        moodChange: 5,
      },
    ],
    completed: false,
  },
  {
    id: 'task_savings_2',
    topic: 'savings',
    theme: 'savings',
    topicTitle: 'Формирование сбережений',
    title: 'Непредвиденные расходы',
    situation:
      'У Финни неожиданно сломалась кисть для рисования. Новая стоит 12 монет. Откуда правильнее взять средства?',
    scenario:
      'У Финни неожиданно сломалась кисть для рисования. Новая стоит 12 монет. Откуда правильнее взять средства?',
    availableResources: 'В кошельке: 5 монет. В копилке: 35 монет.',
    difficulty: 'hard',
    unlockRule: { minPeriod: 2 },
    reward: 12,
    educationalExplanation:
      'Копилка мечты неприкосновенна! На непредвиденные нужды лучше заработать дополнительно, чем разрушать долгосрочный план.',
    possibleActions: [
      {
        id: 'ts2_opt1',
        text: 'Выполнить задание в парке и заработать монеты, не трогая копилку мечты',
        isCorrect: true,
        consequence: {
          balanceChange: 12,
          savingsChange: 0,
          satietyChange: 0,
          moodChange: 20,
          explanation:
            'Превосходно! Ты проявил характер и трудолюбие: кисть куплена, а заветная цель осталась в безопасности.',
          nextStepRecommendation:
            'Защита копилки от лишних трат — признак финансово грамотного лидера.',
        },
      },
      {
        id: 'ts2_opt2',
        text: 'Разбить копилку и потратить накопления на кисть',
        isCorrect: false,
        consequence: {
          balanceChange: 3,
          savingsChange: -12,
          satietyChange: 0,
          moodChange: -10,
          explanation:
            'Снятие денег из целевой копилки отдалило мечту на целый месяц. Финни загрустил.',
          nextStepRecommendation:
            'Старайся иметь резерв или зарабатывать монеты при внезапных тратах.',
        },
      },
    ],
    options: [
      {
        id: 'ts2_opt1',
        text: 'Выполнить задание в парке и заработать монеты, не трогая копилку мечты',
        isCorrect: true,
        explanation:
          'Превосходно! Сохранение копилки защищает твой план и воспитывает выдержку.',
        rewardChange: 12,
        moodChange: 20,
      },
      {
        id: 'ts2_opt2',
        text: 'Разбить копилку и потратить накопления на кисть',
        isCorrect: false,
        explanation:
          'Снятие денег из целевой копилки отдаляет мечту. Копилку трогать нельзя без крайней нужды.',
        rewardChange: 3,
        moodChange: -10,
      },
    ],
    completed: false,
  },

  // --- ТЕМА 3: ПОКУПКИ И ПЛАТЕЖИ ---
  {
    id: 'task_payments_1',
    topic: 'payments',
    theme: 'payments',
    topicTitle: 'Покупки и платежи',
    title: 'Выбираем в продуктовой лавке',
    situation:
      'Финни проголодался. В лавке есть свежая морковка за 5 монет (+25 сытости) и огромный леденец за 15 монет (+5 сытости). Баланс: 18 монет.',
    scenario:
      'Финни проголодался. В лавке есть свежая морковка за 5 монет (+25 сытости) и огромный леденец за 15 монет (+5 сытости). Баланс: 18 монет.',
    availableResources: 'Баланс: 18 монет. Финни проголодался.',
    difficulty: 'easy',
    unlockRule: { minPeriod: 1 },
    reward: 10,
    educationalExplanation:
      'Цена не всегда равна пользе! Полезная еда дает максимум сытости за небольшие деньги, сохраняя остаток в кармане.',
    possibleActions: [
      {
        id: 'tp1_opt1',
        text: 'Купить полезную морковку за 5 монет: сытно, полезно и экономно',
        isCorrect: true,
        consequence: {
          balanceChange: 10,
          satietyChange: 30,
          moodChange: 15,
          explanation:
            'Идеальный выбор! Финни сыт, доволен, а в кошельке осталось 13 монет на другие полезные дела.',
          nextStepRecommendation:
            'Следи за индикатором сытости в комнате — не допускай голода!',
        },
      },
      {
        id: 'tp1_opt2',
        text: 'Купить дорогой леденец за 15 монет',
        isCorrect: false,
        consequence: {
          balanceChange: 2,
          satietyChange: 5,
          moodChange: 10,
          explanation:
            'Леденец вкусный, но сытости почти не дал, а почти все деньги испарились.',
          nextStepRecommendation:
            'Обращай внимание на реальную пользу товара, а не только на яркую обёртку.',
        },
      },
    ],
    options: [
      {
        id: 'tp1_opt1',
        text: 'Купить полезную морковку за 5 монет: сытно, полезно и экономно',
        isCorrect: true,
        explanation:
          'Идеальный выбор! Отличное соотношение цены и сытости: Финни наелся, и деньги целы.',
        rewardChange: 10,
        moodChange: 15,
        satietyChange: 30,
      },
      {
        id: 'tp1_opt2',
        text: 'Купить дорогой леденец за 15 монет',
        isCorrect: false,
        explanation:
          'Леденец сытости почти не дал, а почти все деньги закончились.',
        rewardChange: 2,
        moodChange: 10,
        satietyChange: 5,
      },
    ],
    completed: false,
  },
  {
    id: 'task_payments_2',
    topic: 'payments',
    theme: 'payments',
    topicTitle: 'Покупки и платежи',
    title: 'Акция и разумный выбор',
    situation:
      'В магазине проходит акция: 2 тюбика краски за 20 монет (вместо 30 по отдельности). Финни сейчас нужен только 1 тюбик (15 монет). Баланс: 25 монет.',
    scenario:
      'В магазине проходит акция: 2 тюбика краски за 20 монет (вместо 30 по отдельности). Финни сейчас нужен только 1 тюбик. Как поступить?',
    availableResources: 'Баланс: 25 монет. Нужен 1 тюбик краски.',
    difficulty: 'medium',
    unlockRule: { minPeriod: 2 },
    reward: 10,
    educationalExplanation:
      'Скидка выгодна только тогда, когда второй товар действительно пригодится и не оставляет тебя без средств на еду.',
    possibleActions: [
      {
        id: 'tp2_opt1',
        text: 'Если второй цвет точно пригодится для картины — взять по акции, сэкономив 10 монет',
        isCorrect: true,
        consequence: {
          balanceChange: 10,
          satietyChange: 0,
          moodChange: 25,
          explanation:
            'Мудрый расчёт! Ты сэкономил 10 монет на краске, которая гарантированно будет использована.',
          nextStepRecommendation:
            'Используй скидки только на нужные товары, а не на всё подряд.',
        },
      },
      {
        id: 'tp2_opt2',
        text: 'Купить 5 разных наборов по акции, заняв недостающие монеты у друзей',
        isCorrect: false,
        consequence: {
          balanceChange: 2,
          satietyChange: 0,
          moodChange: -5,
          explanation:
            'Опасное решение! Занимать деньги на вещи, которые сейчас не нужны — прямой путь к финансовым трудностям.',
          nextStepRecommendation:
            'Никогда не бери в долг ради спонтанных покупок по скидке.',
        },
      },
    ],
    options: [
      {
        id: 'tp2_opt1',
        text: 'Если второй цвет точно пригодится для картины — взять по акции, сэкономив 10 монет',
        isCorrect: true,
        explanation:
          'Мудрый расчёт! Покупка нужного набора со скидкой бережёт бюджет.',
        rewardChange: 10,
        moodChange: 25,
      },
      {
        id: 'tp2_opt2',
        text: 'Купить 5 разных наборов по акции, заняв недостающие монеты',
        isCorrect: false,
        explanation:
          'Скидка — не повод покупать лишнее или влезать в долги. Избегай спонтанных переплат!',
        rewardChange: 2,
        moodChange: -5,
      },
    ],
    completed: false,
  },
];
