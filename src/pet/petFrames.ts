declare const require: any;

const safeAsset = (fn: () => any, fallbackId: string) => {
  try {
    return fn();
  } catch {
    return { uri: fallbackId };
  }
};

// Photorealistic 3D Character Asset Mappings with graceful Node/Metro compatibility
export const PET_CUSTOM_ASSETS = {
  sweaters: {
    green: safeAsset(() => require('../../assets/pet_custom/sweater_green.png'), 'sweater_green'),
    blue: safeAsset(() => require('../../assets/pet_custom/sweater_blue.png'), 'sweater_blue'),
    red: safeAsset(() => require('../../assets/pet_custom/sweater_red.png'), 'sweater_red'),
  },
  hats: {
    none: null,
    beret: safeAsset(() => require('../../assets/pet_custom/hat_beret.png'), 'hat_beret'),
    glasses: safeAsset(() => require('../../assets/pet_custom/hat_glasses.png'), 'hat_glasses'),
  },
  stages: {
    1: safeAsset(() => require('../../assets/pet_custom/sweater_green.png'), 'stage_1'),
    2: safeAsset(() => require('../../assets/pet_custom/hat_beret.png'), 'stage_2'),
    3: safeAsset(() => require('../../assets/pet_custom/stage_master.png'), 'stage_3'),
  },
  actions: {
    idle: safeAsset(() => require('../../assets/pet_actions/idle.png'), 'action_idle'),
    blink: safeAsset(() => require('../../assets/finny_blink.png'), 'action_blink'),
    waving: safeAsset(() => require('../../assets/finny_waving.png'), 'action_waving'),
    celebrating: safeAsset(() => require('../../assets/pet_actions/celebrating.png'), 'action_celebrating'),
    eating: safeAsset(() => require('../../assets/pet_actions/eating.png'), 'action_eating'),
    sleeping: safeAsset(() => require('../../assets/pet_actions/sleeping.png'), 'action_sleeping'),
  },
  thumbs: {
    green: safeAsset(() => require('../../assets/pet_custom/thumb_green.png'), 'thumb_green'),
    blue: safeAsset(() => require('../../assets/pet_custom/thumb_blue.png'), 'thumb_blue'),
    red: safeAsset(() => require('../../assets/pet_custom/thumb_red.png'), 'thumb_red'),
    beret: safeAsset(() => require('../../assets/pet_custom/thumb_beret.png'), 'thumb_beret'),
    glasses: safeAsset(() => require('../../assets/pet_custom/thumb_glasses.png'), 'thumb_glasses'),
    master: safeAsset(() => require('../../assets/pet_custom/thumb_master.png'), 'thumb_master'),
  },
};

export type PetAnimationType =
  | 'idle'
  | 'blink'
  | 'happy'
  | 'celebrating'
  | 'eating'
  | 'sleeping'
  | 'waving';
