import { CharacterSpeciesId, PetAppearance } from '../types/gameTypes';

declare const require: any;

const safeRequire = (fn: () => any, fallbackId: string = 'asset') => {
  try {
    return fn();
  } catch {
    return { uri: fallbackId };
  }
};

export interface CharacterArtDefinition {
  id: CharacterSpeciesId;
  name: string;
  speciesTitle: string;
  bodySource: any;
  thumbSource: any;
  headOffset: { x: number; y: number };
  canvasDimensions: { width: number; height: number; baselineY: number };
}

export const PET_ART_CHARACTERS: Record<CharacterSpeciesId, CharacterArtDefinition> = {
  raccoon: {
    id: 'raccoon',
    name: 'Енот Ричи',
    speciesTitle: 'Любознательный енот',
    bodySource: safeRequire(() => require('../../assets/pets/raccoon/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/raccoon/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  fox: {
    id: 'fox',
    name: 'Лисёнок Фокс',
    speciesTitle: 'Находчивый лисёнок',
    bodySource: safeRequire(() => require('../../assets/pets/fox/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/fox/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  cat: {
    id: 'cat',
    name: 'Кот Барсик',
    speciesTitle: 'Уютный котик',
    bodySource: safeRequire(() => require('../../assets/pets/cat/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/cat/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  panda: {
    id: 'panda',
    name: 'Панда Бао',
    speciesTitle: 'Добрый панда',
    bodySource: safeRequire(() => require('../../assets/pets/panda/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/panda/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  capybara: {
    id: 'capybara',
    name: 'Капибара Капи',
    speciesTitle: 'Дзен-капибара',
    bodySource: safeRequire(() => require('../../assets/pets/capybara/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/capybara/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  rabbit: {
    id: 'rabbit',
    name: 'Кролик Финни',
    speciesTitle: 'Шустрый кролик',
    bodySource: safeRequire(() => require('../../assets/pets/rabbit/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/rabbit/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  bear: {
    id: 'bear',
    name: 'Медвежонок Миша',
    speciesTitle: 'Надёжный медвежонок',
    bodySource: safeRequire(() => require('../../assets/pets/bear/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/bear/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  dog: {
    id: 'dog',
    name: 'Щенок Дружок',
    speciesTitle: 'Преданный щенок',
    bodySource: safeRequire(() => require('../../assets/pets/dog/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/dog/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
  otter: {
    id: 'otter',
    name: 'Выдра Луки',
    speciesTitle: 'Игривая выдра',
    bodySource: safeRequire(() => require('../../assets/pets/otter/body.png')),
    thumbSource: safeRequire(() => require('../../assets/pets/otter/thumb.png')),
    headOffset: { x: 0, y: 0 },
    canvasDimensions: { width: 400, height: 480, baselineY: 465 },
  },
};

export const PET_ACCESSORY_ASSETS = {
  hats: {
    none: null,
    beret: safeRequire(() => require('../../assets/pets/accessories/beret.png')),
    glasses: safeRequire(() => require('../../assets/pets/accessories/glasses.png')),
  },
  brooches: {
    clover: safeRequire(() => require('../../assets/pets/accessories/clover.png')),
    star: safeRequire(() => require('../../assets/pets/accessories/star.png')),
    brush: safeRequire(() => require('../../assets/pets/accessories/brush.png')),
  },
  shadow: safeRequire(() => require('../../assets/pets/shadow.png')),
};

export function getCharacterArt(speciesId?: CharacterSpeciesId): CharacterArtDefinition {
  const resolved = speciesId && PET_ART_CHARACTERS[speciesId] ? speciesId : 'rabbit';
  return PET_ART_CHARACTERS[resolved];
}
