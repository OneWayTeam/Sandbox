// Photorealistic 3D Character Asset Mappings
export const PET_CUSTOM_ASSETS = {
  sweaters: {
    green: require('../../assets/pet_custom/sweater_green.png'),
    blue: require('../../assets/pet_custom/sweater_blue.png'),
    red: require('../../assets/pet_custom/sweater_red.png'),
  },
  hats: {
    none: null,
    beret: require('../../assets/pet_custom/hat_beret.png'),
    glasses: require('../../assets/pet_custom/hat_glasses.png'),
  },
  stages: {
    1: require('../../assets/pet_custom/sweater_green.png'),
    2: require('../../assets/pet_custom/hat_beret.png'),
    3: require('../../assets/pet_custom/stage_master.png'),
  },
  actions: {
    idle: require('../../assets/pet_actions/idle.png'),
    blink: require('../../assets/finny_blink.png'),
    waving: require('../../assets/finny_waving.png'),
    celebrating: require('../../assets/pet_actions/celebrating.png'),
    eating: require('../../assets/pet_actions/eating.png'),
    sleeping: require('../../assets/pet_actions/sleeping.png'),
  },
  thumbs: {
    green: require('../../assets/pet_custom/thumb_green.png'),
    blue: require('../../assets/pet_custom/thumb_blue.png'),
    red: require('../../assets/pet_custom/thumb_red.png'),
    beret: require('../../assets/pet_custom/thumb_beret.png'),
    glasses: require('../../assets/pet_custom/thumb_glasses.png'),
    master: require('../../assets/pet_custom/thumb_master.png'),
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

export const PET_FRAMES = {
  idle: [
    require('../../assets/pet/idle/01.png'),
    require('../../assets/pet/idle/02.png'),
    require('../../assets/pet/idle/03.png'),
    require('../../assets/pet/idle/04.png'),
    require('../../assets/pet/idle/05.png'),
    require('../../assets/pet/idle/06.png'),
    require('../../assets/pet/idle/07.png'),
    require('../../assets/pet/idle/08.png'),
    require('../../assets/pet/idle/09.png'),
    require('../../assets/pet/idle/10.png'),
    require('../../assets/pet/idle/11.png'),
    require('../../assets/pet/idle/12.png'),
    require('../../assets/pet/idle/13.png'),
    require('../../assets/pet/idle/14.png'),
  ],
  blink: [
    require('../../assets/pet/blink/01.png'),
    require('../../assets/pet/blink/02.png'),
    require('../../assets/pet/blink/03.png'),
    require('../../assets/pet/blink/04.png'),
    require('../../assets/pet/blink/05.png'),
    require('../../assets/pet/blink/06.png'),
  ],
  happy: [
    require('../../assets/pet/happy/01.png'),
    require('../../assets/pet/happy/02.png'),
    require('../../assets/pet/happy/03.png'),
    require('../../assets/pet/happy/04.png'),
    require('../../assets/pet/happy/05.png'),
    require('../../assets/pet/happy/06.png'),
    require('../../assets/pet/happy/07.png'),
    require('../../assets/pet/happy/08.png'),
    require('../../assets/pet/happy/09.png'),
    require('../../assets/pet/happy/10.png'),
    require('../../assets/pet/happy/11.png'),
    require('../../assets/pet/happy/12.png'),
    require('../../assets/pet/happy/13.png'),
    require('../../assets/pet/happy/14.png'),
    require('../../assets/pet/happy/15.png'),
    require('../../assets/pet/happy/16.png'),
  ],
  sleep: [
    require('../../assets/pet/sleep/01.png'),
    require('../../assets/pet/sleep/02.png'),
    require('../../assets/pet/sleep/03.png'),
    require('../../assets/pet/sleep/04.png'),
    require('../../assets/pet/sleep/05.png'),
    require('../../assets/pet/sleep/06.png'),
    require('../../assets/pet/sleep/07.png'),
    require('../../assets/pet/sleep/08.png'),
    require('../../assets/pet/sleep/09.png'),
    require('../../assets/pet/sleep/10.png'),
    require('../../assets/pet/sleep/11.png'),
    require('../../assets/pet/sleep/12.png'),
  ],
  sad: [
    require('../../assets/pet/sad/01.png'),
    require('../../assets/pet/sad/02.png'),
    require('../../assets/pet/sad/03.png'),
    require('../../assets/pet/sad/04.png'),
    require('../../assets/pet/sad/05.png'),
    require('../../assets/pet/sad/06.png'),
    require('../../assets/pet/sad/07.png'),
    require('../../assets/pet/sad/08.png'),
  ],
};
