import { PetAppearance } from '../types/gameTypes';

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

export interface PetCharacterDefinition {
  id: CharacterSpeciesId;
  name: string;
  speciesTitle: string;
  tagline: string;
  personality: string;
  story: string;
  themeColor: string;
  accentColor: string;
  badgeBg: string;
  defaultAppearance: PetAppearance;
}

export const PET_CHARACTERS: PetCharacterDefinition[] = [
  {
    id: 'raccoon',
    name: 'Енот Ричи',
    speciesTitle: 'Любознательный енот',
    tagline: 'Умеет находить лучшие решения и бережно хранить сбережения',
    personality: 'Энергичный, сообразительный, любит считать монетки и наводить порядок',
    story: 'Ричи всегда проверяет сдачу и знает, как не потратить лишнего на ненужные блестяшки!',
    themeColor: '#475569',
    accentColor: '#0EA5E9',
    badgeBg: '#F1F5F9',
    defaultAppearance: {
      characterId: 'raccoon',
      sweaterColor: 'blue',
      hat: 'glasses',
      accessory: 'clover',
    },
  },
  {
    id: 'fox',
    name: 'Лисёнок Фокс',
    speciesTitle: 'Находчивый лисёнок',
    tagline: 'Мудро планирует бюджет и всегда замечает скрытые расходы',
    personality: 'Умный, весёлый, обожает логические задачи и хитрые скидки',
    story: 'Фокс уверен: самый умный покупатель — это тот, кто сначала подумал, а потом купил!',
    themeColor: '#EA580C',
    accentColor: '#F59E0B',
    badgeBg: '#FFF7ED',
    defaultAppearance: {
      characterId: 'fox',
      sweaterColor: 'green',
      hat: 'none',
      accessory: 'star',
    },
  },
  {
    id: 'cat',
    name: 'Кот Барсик',
    speciesTitle: 'Уютный котик',
    tagline: 'Ценит домашний уют, тёплые вещи и надёжную финансовую подушку',
    personality: 'Спокойный, рассудительный, никогда не делает импульсивных покупок',
    story: 'Барсик любит мурлыкать под пледом и точно знает, сколько монет отложено в копилку на мечту.',
    themeColor: '#8B5CF6',
    accentColor: '#EC4899',
    badgeBg: '#F5F3FF',
    defaultAppearance: {
      characterId: 'cat',
      sweaterColor: 'red',
      hat: 'beret',
      accessory: 'brush',
    },
  },
  {
    id: 'panda',
    name: 'Панда Бао',
    speciesTitle: 'Добрый панда',
    tagline: 'Терпеливо и не спеша идёт к самым большим и важным целям',
    personality: 'Терпеливый, добрый, умеет ждать и радоваться каждому шагу',
    story: 'Бао напоминает: даже самая большая цель начинается с одной маленькой отложенной монетки!',
    themeColor: '#1E293B',
    accentColor: '#10B981',
    badgeBg: '#ECFDF5',
    defaultAppearance: {
      characterId: 'panda',
      sweaterColor: 'green',
      hat: 'none',
      accessory: 'clover',
    },
  },
  {
    id: 'capybara',
    name: 'Капибара Капи',
    speciesTitle: 'Дзен-капибара',
    tagline: 'Абсолютное спокойствие: никакой паники при распределении бюджета',
    personality: 'Дружелюбная, умиротворённая, сохраняет баланс в любых ситуациях',
    story: 'Капи учит хладнокровию: если денег пока не хватает — мы просто составим план и накопим.',
    themeColor: '#B45309',
    accentColor: '#F59E0B',
    badgeBg: '#FEF3C7',
    defaultAppearance: {
      characterId: 'capybara',
      sweaterColor: 'blue',
      hat: 'none',
      accessory: 'clover',
    },
  },
  {
    id: 'rabbit',
    name: 'Кролик Финни',
    speciesTitle: 'Шустрый кролик',
    tagline: 'Первый друг и проводник в мир личных финансов и грамотных трат',
    personality: 'Жизнерадостный, прыгучий, искренне радуется каждой победе игрока',
    story: 'Финни — классический любимец детей, готовый вместе учиться считать карманные деньги.',
    themeColor: '#16A34A',
    accentColor: '#22C55E',
    badgeBg: '#DCFCE7',
    defaultAppearance: {
      characterId: 'rabbit',
      sweaterColor: 'green',
      hat: 'none',
      accessory: 'clover',
    },
  },
  {
    id: 'bear',
    name: 'Медвежонок Миша',
    speciesTitle: 'Надёжный медвежонок',
    tagline: 'Создаёт крепкую финансовую основу и защищает сбережения в сейфе',
    personality: 'Сильный, надёжный, защитник семейного бюджета и верный друг',
    story: 'Миша как настоящий хранитель сейфа следит, чтобы копилка не опустела раньше времени.',
    themeColor: '#78350F',
    accentColor: '#D97706',
    badgeBg: '#FEF3C7',
    defaultAppearance: {
      characterId: 'bear',
      sweaterColor: 'red',
      hat: 'beret',
      accessory: 'star',
    },
  },
  {
    id: 'dog',
    name: 'Щенок Дружок',
    speciesTitle: 'Преданный щенок',
    tagline: 'Всегда готов поддержать и помочь выполнить ежедневные задачи',
    personality: 'Преданный, открытый, с энтузиазмом берётся за новые задания в парке',
    story: 'Дружок радуется каждому выполненному уроку и весело виляет хвостиком при пополнении копилки!',
    themeColor: '#CA8A04',
    accentColor: '#EAB308',
    badgeBg: '#FEF9C3',
    defaultAppearance: {
      characterId: 'dog',
      sweaterColor: 'blue',
      hat: 'none',
      accessory: 'clover',
    },
  },
  {
    id: 'otter',
    name: 'Выдра Луки',
    speciesTitle: 'Игривая выдра',
    tagline: 'Ловко плавает в потоке доходов и расходов, сохраняя баланс',
    personality: 'Любознательная, ловкая, обожает творчество и полезные покупки',
    story: 'Луки бережёт свои любимые вещи, как камешки на животике, и умеет ставить смелые цели!',
    themeColor: '#0284C7',
    accentColor: '#38BDF8',
    badgeBg: '#E0F2FE',
    defaultAppearance: {
      characterId: 'otter',
      sweaterColor: 'green',
      hat: 'glasses',
      accessory: 'brush',
    },
  },
];

export function getCharacterDefinition(characterId?: CharacterSpeciesId): PetCharacterDefinition {
  const found = PET_CHARACTERS.find((c) => c.id === characterId);
  return found || PET_CHARACTERS[5]; // Default to Finny Rabbit
}
