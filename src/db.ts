import { createAnimation, Animation } from './animation';

export const initDb = () => {
  initDbAnims();
  initDbSounds();
};

const dbAnims: Record<string, string> = {};
const dbSounds: Record<string, (number | undefined)[]> = {};

export const initDbAnims = () => {
  const addAnim = (name: string, args: string) => {
    dbAnims[name] = args;
  };

  type IntermediateType = [string, string[]];
  const lrAnims: IntermediateType[] = [
    ['mole', ['s_9', 's_10']],
    ['pl_0', ['s_0']],
    ['pl_1', ['s_1']],
    ['pl_2', ['s_2']],
    ['p_walk', ['s_3']],
    ['p_wait', ['s_3', 's_4']],
    ['p_angry', ['s_7', 's_8']],
  ]

  for (const [name, sprites] of lrAnims) {
    addAnim(name + '_l', 't 300 ' + sprites.join(' '));
    addAnim(name + '_r', 't 300 ' + sprites.map(s => s + '_f').join(' '));
  }

  addAnim('fire', 't 150 s_14 s_15');

  console.log('dbAnims', dbAnims);
};

export const initDbSounds = () => {
  // prettier-ignore
  dbSounds.item = [0.5,,82,.01,.1,.03,3,.6,-21,.2,,,.02,,-34,,,,,.15];
};

export const createAnimationFromDb = (animName: string) => {
  const animStr = dbAnims[animName];
  if (!animStr) {
    throw new Error('No anim: ' + animName);
  }
  const [loop, msStr, ...sprites] = animStr.split(' ');
  const ms = parseInt(msStr);
  return createAnimation([
    loop === 't',
    animName,
    sprites.map(s => {
      return {
        n: s,
        d: ms,
      };
    }),
  ]);
};

export const getSound = (soundName: string) => {
  const s = dbSounds[soundName];
  if (!s) {
    throw new Error('No sound: ' + soundName);
  }
  return s;
};
