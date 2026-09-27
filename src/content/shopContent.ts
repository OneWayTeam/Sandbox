export type ShopItemCategory =
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

export interface PetEffect {
  satietyBoost: number;
  moodBoost: number;
  description: string;
}

export interface PeriodRestrictions {
  minPeriod?: number;
  maxPerPeriod?: number;
}

export interface EducationalShopItem {
  id: string;
  name: string;
  title: string; // alias for UI compatibility
  price: number;
  category: ShopItemCategory;
  categoryLabel: string;
  description: string;
  type: 'mandatory' | 'discretionary'; // mandatory vs optional
  petEffect: PetEffect;
  availability: boolean;
  periodRestrictions?: PeriodRestrictions;
  iconName: string;
  // Compatibility fields for GameEngine & UI
  satietyBoost: number;
  moodBoost: number;
}

export const EDUCATIONAL_SHOP_ITEMS: EducationalShopItem[] = [
  // ==========================================
  // --- MANDATORY (Базовые потребности) ---
  // ==========================================

  // 1. ЕДА: Морковка
  {
    id: 'food_carrot',
    name: 'Сладкая морковка',
    title: 'Сладкая морковка',
    price: 5,
    category: 'food',
    categoryLabel: 'Еда и питание',
    description: 'Полезный хрустящий завтрак. Дает питомцу заряд энергии и витаминов.',
    type: 'mandatory',
    petEffect: {
      satietyBoost: 25,
      moodBoost: 5,
      description: 'Финни подкрепился полезной пищей (+25% сытости, +5% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'carrot',
    satietyBoost: 25,
    moodBoost: 5,
  },

  // 2. ЕДА: Спелое яблоко
  {
    id: 'food_apple',
    name: 'Спелое яблоко',
    title: 'Спелое яблоко',
    price: 4,
    category: 'food',
    categoryLabel: 'Еда и питание',
    description: 'Сочный витаминный перекус для поддержания бодрости и сил.',
    type: 'mandatory',
    petEffect: {
      satietyBoost: 20,
      moodBoost: 5,
      description: 'Полезный перекус утолил легкий голод (+20% сытости, +5% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'apple',
    satietyBoost: 20,
    moodBoost: 5,
  },

  // 3. УХОД: Щёточка для шерстки
  {
    id: 'care_brush',
    name: 'Щёточка для ухода',
    title: 'Щёточка для ухода',
    price: 8,
    category: 'care',
    categoryLabel: 'Уход и гигиена',
    description: 'Регулярная гигиена и бережная чистка шерстки — обязательная забота о здоровье.',
    type: 'mandatory',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 20,
      description: 'Шерстка Финни блестит и выглядит ухоженной (+20% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'brush_care',
    satietyBoost: 0,
    moodBoost: 20,
  },

  // 4. УХОД: Травяной чай
  {
    id: 'care_tea',
    name: 'Витаминный сбор',
    title: 'Витаминный сбор',
    price: 10,
    category: 'care',
    categoryLabel: 'Уход и гигиена',
    description: 'Теплый ромашковый настой для крепкого здоровья и спокойного сна.',
    type: 'mandatory',
    petEffect: {
      satietyBoost: 30,
      moodBoost: 15,
      description: 'Травяной чай согрел Финни и укрепил иммунитет (+30% сытости, +15% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'tea',
    satietyBoost: 30,
    moodBoost: 15,
  },

  // 5. ДРУГИЕ БАЗОВЫЕ ПОТРЕБНОСТИ: Натуральное мыло
  {
    id: 'needs_soap',
    name: 'Натуральное мыло',
    title: 'Натуральное мыло',
    price: 6,
    category: 'needs',
    categoryLabel: 'Базовые потребности',
    description: 'Душистое мыло из ромашки для чистоты лапок после прогулки в парке.',
    type: 'mandatory',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 15,
      description: 'Лапки чистые и пахнут луговыми цветами (+15% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'brush_care',
    satietyBoost: 0,
    moodBoost: 15,
  },

  // ==========================================
  // --- OPTIONAL (Необязательные желания) ---
  // ==========================================

  // 6. ИГРУШКА: Мячик-попрыгунчик
  {
    id: 'toy_ball',
    name: 'Мячик-попрыгунчик',
    title: 'Мячик-попрыгунчик',
    price: 12,
    category: 'toy',
    categoryLabel: 'Игрушки',
    description: 'Яркий прыгучий мячик для веселых тренировок и игр в комнате.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 25,
      description: 'Финни с удовольствием прыгает за мячиком (+25% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'palette',
    satietyBoost: 0,
    moodBoost: 25,
  },

  // 7. УКРАШЕНИЕ: Цветок в горшочке
  {
    id: 'decoration_flower',
    name: 'Цветок в горшочке',
    title: 'Цветок в горшочке',
    price: 14,
    category: 'decoration',
    categoryLabel: 'Украшения интерьера',
    description: 'Живое комнатное растение делает комнату питомца по-домашнему уютной.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 25,
      description: 'Красивый зеленый уголок радует глаз каждый день (+25% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'apple',
    satietyBoost: 0,
    moodBoost: 25,
  },

  // 8. АКСЕССУАР: Вязаный шарф
  {
    id: 'clothes_scarf',
    name: 'Вязаный шарф',
    title: 'Вязаный шарф',
    price: 18,
    category: 'accessory',
    categoryLabel: 'Аксессуары и одежда',
    description: 'Мягкий шерстяной шарфик защитит горлышко от прохладного ветра.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 25,
      description: 'Уютный шарф согревает питомца на прогулках (+25% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'scarf',
    satietyBoost: 0,
    moodBoost: 25,
  },

  // 9. АКСЕССУАР: Бордовый берет
  {
    id: 'clothes_beret',
    name: 'Бордовый берет',
    title: 'Бордовый берет',
    price: 22,
    category: 'accessory',
    categoryLabel: 'Аксессуары и одежда',
    description: 'Стильный бордовый берет придает питомцу изысканный образ.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 30,
      description: 'Питомец чувствует себя вдохновленным (+30% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'beret',
    satietyBoost: 0,
    moodBoost: 30,
  },

  // 10. РАЗВЛЕЧЕНИЕ: Головоломка
  {
    id: 'entertainment_puzzle',
    name: 'Настольная головоломка',
    title: 'Настольная головоломка',
    price: 20,
    category: 'entertainment',
    categoryLabel: 'Развлечения и игры',
    description: 'Увлекательная деревянная головоломка развивает логику и смекалку.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 30,
      description: 'Финни успешно собрал сложный пазл и ликует (+30% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 2 },
    iconName: 'chair',
    satietyBoost: 0,
    moodBoost: 30,
  },

  // 11. ДРУГОЕ ЖЕЛАНИЕ / ТВОРЧЕСТВО: Холст и палитра
  {
    id: 'art_palette',
    name: 'Холст и палитра',
    title: 'Холст и палитра',
    price: 25,
    category: 'art',
    categoryLabel: 'Творчество и хобби',
    description: 'Широкая деревянная палитра для смешивания красок и создания набросков.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 35,
      description: 'Яркие мазки красок принесли море радости (+35% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 1 },
    iconName: 'palette',
    satietyBoost: 0,
    moodBoost: 35,
  },

  // 12. ДРУГОЕ ЖЕЛАНИЕ / ИНТЕРЬЕР: Уютное кресло
  {
    id: 'furniture_chair',
    name: 'Уютное кресло',
    title: 'Уютное кресло',
    price: 35,
    category: 'furniture',
    categoryLabel: 'Мебель и уют',
    description: 'Мягкое кресло, где приятно отдыхать и читать сказки после рисования.',
    type: 'discretionary',
    petEffect: {
      satietyBoost: 0,
      moodBoost: 40,
      description: 'Финни сладко свернулся калачиком в новом кресле (+40% настроения).',
    },
    availability: true,
    periodRestrictions: { minPeriod: 2 },
    iconName: 'chair',
    satietyBoost: 0,
    moodBoost: 40,
  },
];
