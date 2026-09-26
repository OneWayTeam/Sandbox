import { PetAppearance, PetStage, PetMoodState } from '../types/gameTypes';
import { PET_CUSTOM_ASSETS, PetAnimationType } from './petFrames';

export interface CustomizationOptionItem<T = string> {
  id: T;
  title: string;
  category: 'color' | 'hat' | 'accessory';
  thumbSource: any;
  description: string;
  isUnlockedDefault: boolean;
}

export interface PetVisualLayers {
  basePhotoSource: any;
  actionPhotoSource?: any;
  stageTitle: string;
  moodState: PetMoodState;
  moodLabel: string;
  accessoryBadge: {
    type: 'clover' | 'star' | 'brush';
    bgColor: string;
    borderColor: string;
    iconColor: string;
  } | null;
  accessibilityDescription: string;
}

/**
 * Photorealistic 3D Asset Abstraction Registry
 * Decouples asset paths and combination logic from rendering components
 */
export class PetAssetRegistry {
  public static readonly SWEATER_OPTIONS: CustomizationOptionItem<PetAppearance['sweaterColor']>[] = [
    {
      id: 'green',
      title: 'Изумрудный свитер',
      category: 'color',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.green,
      description: 'Тёплый вязаный свитер свежего мятного оттенка.',
      isUnlockedDefault: true,
    },
    {
      id: 'blue',
      title: 'Лазурный свитер',
      category: 'color',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.blue,
      description: 'Элегантный свитер цвета ясного неба.',
      isUnlockedDefault: true,
    },
    {
      id: 'red',
      title: 'Терракотовый свитер',
      category: 'color',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.red,
      description: 'Уютный свитер тёплого осеннего цвета.',
      isUnlockedDefault: true,
    },
  ];

  public static readonly HAT_OPTIONS: CustomizationOptionItem<PetAppearance['hat']>[] = [
    {
      id: 'none',
      title: 'Без головного убора',
      category: 'hat',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.green,
      description: 'Естественный вид с пушистыми ушками.',
      isUnlockedDefault: true,
    },
    {
      id: 'beret',
      title: 'Бордовый берет',
      category: 'hat',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.beret,
      description: 'Классический берет художника.',
      isUnlockedDefault: true,
    },
    {
      id: 'glasses',
      title: 'Очки мастера',
      category: 'hat',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.glasses,
      description: 'Стильные круглые очки для внимательного чтения.',
      isUnlockedDefault: true,
    },
  ];

  public static readonly ACCESSORY_OPTIONS: CustomizationOptionItem<PetAppearance['accessory']>[] = [
    {
      id: 'clover',
      title: 'Брошь клевера',
      category: 'accessory',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.green,
      description: 'Четырёхлистный клевер на удачу в делах.',
      isUnlockedDefault: true,
    },
    {
      id: 'star',
      title: 'Звёздная брошь',
      category: 'accessory',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.master,
      description: 'Золотая звёздочка за финансовую дисциплину.',
      isUnlockedDefault: true,
    },
    {
      id: 'brush',
      title: 'Кисть мастера',
      category: 'accessory',
      thumbSource: PET_CUSTOM_ASSETS.thumbs.beret,
      description: 'Миниатюрная серебряная кисточка юного живописца.',
      isUnlockedDefault: true,
    },
  ];

  /**
   * Count total visually distinct customization combinations
   * Formula: Sweaters (3) * Hats (3) * Accessories (3) = 27 combinations per stage
   * Across 3 stages: 27 * 3 = 81 visual configurations!
   */
  public static getCombinationsCount(): { perStage: number; totalWithStages: number } {
    const perStage =
      this.SWEATER_OPTIONS.length * this.HAT_OPTIONS.length * this.ACCESSORY_OPTIONS.length;
    return {
      perStage,
      totalWithStages: perStage * 3,
    };
  }

  /**
   * Resolves visual layers based on customization, stage, mood, and animation
   */
  public static resolveLayers(
    appearance: PetAppearance,
    stage: PetStage = 1,
    moodState: PetMoodState = 'calm',
    currentAnim: PetAnimationType = 'idle'
  ): PetVisualLayers {
    // 1. Stage title & base photo
    let stageTitle = 'Малыш-исследователь';
    let basePhotoSource = PET_CUSTOM_ASSETS.sweaters.green;

    if (stage === 3) {
      stageTitle = 'Мастер-иллюстратор';
      basePhotoSource = PET_CUSTOM_ASSETS.stages[3];
    } else if (stage === 2 && appearance.hat === 'none') {
      stageTitle = 'Юный мастер';
      basePhotoSource = PET_CUSTOM_ASSETS.stages[2];
    } else {
      // Stage 1 or custom hat selection
      if (appearance.hat === 'beret') {
        basePhotoSource = PET_CUSTOM_ASSETS.hats.beret;
      } else if (appearance.hat === 'glasses') {
        basePhotoSource = PET_CUSTOM_ASSETS.hats.glasses;
      } else if (appearance.sweaterColor === 'blue') {
        basePhotoSource = PET_CUSTOM_ASSETS.sweaters.blue;
      } else if (appearance.sweaterColor === 'red') {
        basePhotoSource = PET_CUSTOM_ASSETS.sweaters.red;
      } else {
        basePhotoSource = PET_CUSTOM_ASSETS.sweaters.green;
      }
    }

    // 2. Action photo (if actively animating celebrating/eating/sleeping/waving/blink)
    let actionPhotoSource: any = null;
    if (currentAnim === 'blink') {
      actionPhotoSource = PET_CUSTOM_ASSETS.actions.blink;
    } else if (currentAnim === 'celebrating' || currentAnim === 'happy') {
      actionPhotoSource = PET_CUSTOM_ASSETS.actions.celebrating;
    } else if (currentAnim === 'eating') {
      actionPhotoSource = PET_CUSTOM_ASSETS.actions.eating;
    } else if (currentAnim === 'sleeping') {
      actionPhotoSource = PET_CUSTOM_ASSETS.actions.sleeping;
    } else if (currentAnim === 'waving') {
      actionPhotoSource = PET_CUSTOM_ASSETS.actions.waving;
    }

    // 3. Accessory brooch styling
    let accessoryBadge: PetVisualLayers['accessoryBadge'] = null;
    if (appearance.accessory === 'clover') {
      accessoryBadge = {
        type: 'clover',
        bgColor: '#DCFCE7',
        borderColor: '#16A34A',
        iconColor: '#15803D',
      };
    } else if (appearance.accessory === 'star') {
      accessoryBadge = {
        type: 'star',
        bgColor: '#FEF3C7',
        borderColor: '#D97706',
        iconColor: '#F59E0B',
      };
    } else if (appearance.accessory === 'brush') {
      accessoryBadge = {
        type: 'brush',
        bgColor: '#EDE9FE',
        borderColor: '#7C3AED',
        iconColor: '#7C3AED',
      };
    }

    // 4. Mood human-friendly label
    const moodLabels: Record<PetMoodState, string> = {
      happy: 'Счастлив',
      excited: 'Воодушевлён',
      calm: 'Спокоен',
      worried: 'Задумчив',
      tired: 'Отдыхает',
    };

    const sweaterTitle =
      this.SWEATER_OPTIONS.find((s) => s.id === appearance.sweaterColor)?.title ||
      appearance.sweaterColor;
    const hatTitle =
      this.HAT_OPTIONS.find((h) => h.id === appearance.hat)?.title || 'Без головного убора';
    const accTitle =
      this.ACCESSORY_OPTIONS.find((a) => a.id === appearance.accessory)?.title ||
      appearance.accessory;

    const accessibilityDescription = `Кролик Финни. Стадия: ${stageTitle}. Настроение: ${
      moodLabels[moodState]
    }. Одежда: ${sweaterTitle}, головной убор: ${hatTitle}, аксессуар: ${accTitle}.`;

    return {
      basePhotoSource,
      actionPhotoSource,
      stageTitle,
      moodState,
      moodLabel: moodLabels[moodState],
      accessoryBadge,
      accessibilityDescription,
    };
  }
}
