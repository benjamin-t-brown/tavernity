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
  ];

  for (const [name, sprites] of lrAnims) {
    addAnim(name + '_l', 't 300 ' + sprites.join(' '));
    addAnim(name + '_r', 't 300 ' + sprites.map((s) => s + '_f').join(' '));
  }

  addAnim('fire', 't 150 s_14 s_15');

  console.log('dbAnims', dbAnims);
};

export const initDbSounds = () => {
  // prettier-ignore
  dbSounds.item = [,0,976,,,0,2,.15,-0.4,,-547,.01,,,9.8,.1,,,.06,.03];
  // prettier-ignore
  dbSounds.itemPlace = [,0,104,,.15,.03,2,.38,,-61,,,.15,,,,,,.02,.36];
  // prettier-ignore
  dbSounds.doorOpen = [1.75,,151,.03,.01,.19,2,1.33,-9,,,,,.1,,,,.19,.01];
  // prettier-ignore
  dbSounds.doorClose = [1.24,,339,.12,.05,0,1,.42,-24,.1,,,.08,,-19,.6,,,,.79];
  // prettier-ignore
  dbSounds.step = [1.07,,309,.01,.03,.03,4,.72,,60,60,.04,,,-16,,.06,.09];
  // prettier-ignore
  dbSounds.fill = [1.09,,0,.19,,.02,,2.31,92,-25,927,,,,-1.4,.9,,.5,.09];
  // prettier-ignore
  dbSounds.moleDead = [2.1,,1360,.06,.09,.2,2,1.63,,,,,,.9,-0.4,.1,.03,.57,,.01];

  // dbSounds.moleSpawn = [2.09,,326,.08,,0,4,.02,,4,,,.11,,28,,.1,.01,.22,.67];
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
    sprites.map((s) => {
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

export const FLOOR_TILES = [12, 14, 27, 28, 29];
export const TABLE_TILES = [19, 20, 21, 22];
export const KEG_TILES = [18];

export const isFloorTile = (tileId: number) => {
  return FLOOR_TILES.includes(tileId);
};

export const isVisibleTile = (tileId: number) => {
  return [13, 17, 18, 18, 20, 21, 22].concat(FLOOR_TILES).includes(tileId);
};

export const isWallTile = (tileId: number) => {
  return !isFloorTile(tileId);
};

export const isClosedDoorTile = (tileId: number) => {
  return tileId === 26;
};
