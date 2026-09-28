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

export interface PetCosmeticOffsets {
  beretTop: number;
  beretLeft: number;
  beretW: number;
  beretH: number;
  beretRotate?: number;
  glassTop: number;
  glassLeft: number;
  glassW: number;
  glassH: number;
  broochTop: number;
  broochLeft: number;
  broochW: number;
  broochH: number;
  sweaterTop?: number;
  sweaterLeft?: number;
  sweaterW?: number;
  sweaterH?: number;
}

export const PET_COSMETIC_OFFSETS: Record<CharacterSpeciesId, PetCosmeticOffsets> = {
  rabbit: {
    beretTop: 70, beretLeft: 122, beretW: 136, beretH: 69, beretRotate: 0,
    glassTop: 134, glassLeft: 74, glassW: 232, glassH: 96,
    broochTop: 295, broochLeft: 168, broochW: 56, broochH: 56,
    sweaterTop: 250, sweaterLeft: 100, sweaterW: 204, sweaterH: 162,
  },
  raccoon: {
    beretTop: 14, beretLeft: 76, beretW: 138, beretH: 70, beretRotate: 0,
    glassTop: 124, glassLeft: 66, glassW: 164, glassH: 68,
    broochTop: 245, broochLeft: 143, broochW: 56, broochH: 56,
    sweaterTop: 210, sweaterLeft: 96, sweaterW: 206, sweaterH: 164,
  },
  fox: {
    beretTop: 35, beretLeft: 97, beretW: 136, beretH: 69, beretRotate: 0,
    glassTop: 113, glassLeft: 80, glassW: 170, glassH: 70,
    broochTop: 232, broochLeft: 150, broochW: 56, broochH: 56,
    sweaterTop: 202, sweaterLeft: 100, sweaterW: 202, sweaterH: 160,
  },
  cat: {
    beretTop: 37, beretLeft: 97, beretW: 136, beretH: 69, beretRotate: 0,
    glassTop: 121, glassLeft: 77, glassW: 176, glassH: 72,
    broochTop: 238, broochLeft: 148, broochW: 56, broochH: 56,
    sweaterTop: 206, sweaterLeft: 98, sweaterW: 202, sweaterH: 160,
  },
  panda: {
    beretTop: 19, beretLeft: 126, beretW: 148, beretH: 75, beretRotate: 0,
    glassTop: 89, glassLeft: 82, glassW: 235, glassH: 97,
    broochTop: 236, broochLeft: 177, broochW: 58, broochH: 58,
    sweaterTop: 205, sweaterLeft: 92, sweaterW: 224, sweaterH: 175,
  },
  capybara: {
    beretTop: 5, beretLeft: 128, beretW: 144, beretH: 73, beretRotate: 0,
    glassTop: 74, glassLeft: 100, glassW: 200, glassH: 82,
    broochTop: 238, broochLeft: 177, broochW: 58, broochH: 58,
    sweaterTop: 205, sweaterLeft: 92, sweaterW: 224, sweaterH: 175,
  },
  bear: {
    beretTop: 10, beretLeft: 127, beretW: 146, beretH: 74, beretRotate: 0,
    glassTop: 106, glassLeft: 96, glassW: 206, glassH: 85,
    broochTop: 246, broochLeft: 176, broochW: 58, broochH: 58,
    sweaterTop: 212, sweaterLeft: 92, sweaterW: 224, sweaterH: 175,
  },
  dog: {
    beretTop: 14, beretLeft: 138, beretW: 140, beretH: 71, beretRotate: 0,
    glassTop: 124, glassLeft: 117, glassW: 174, glassH: 72,
    broochTop: 242, broochLeft: 179, broochW: 56, broochH: 56,
    sweaterTop: 210, sweaterLeft: 96, sweaterW: 212, sweaterH: 166,
  },
  otter: {
    beretTop: 8, beretLeft: 114, beretW: 130, beretH: 66, beretRotate: 0,
    glassTop: 83, glassLeft: 76, glassW: 210, glassH: 86,
    broochTop: 198, broochLeft: 153, broochW: 56, broochH: 56,
    sweaterTop: 168, sweaterLeft: 94, sweaterW: 210, sweaterH: 165,
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
  sweaters: {
    green: safeRequire(() => require('../../assets/pets/accessories/sweater_green.png')),
    blue: safeRequire(() => require('../../assets/pets/accessories/sweater_blue.png')),
    red: safeRequire(() => require('../../assets/pets/accessories/sweater_red.png')),
  },
  shadow: safeRequire(() => require('../../assets/pets/shadow.png')),
};

export function getCosmeticOffsets(speciesId?: CharacterSpeciesId): PetCosmeticOffsets {
  const resolved = speciesId && PET_COSMETIC_OFFSETS[speciesId] ? speciesId : 'rabbit';
  return PET_COSMETIC_OFFSETS[resolved];
}

export function getCharacterArt(speciesId?: CharacterSpeciesId): CharacterArtDefinition {
  const resolved = speciesId && PET_ART_CHARACTERS[speciesId] ? speciesId : 'rabbit';
  return PET_ART_CHARACTERS[resolved];
}

