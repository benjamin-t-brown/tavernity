import {
  CRATE,
  ON_FIRE,
  RUBBLE,
  TABLE_EMPLOYEE_HORIZONTAL,
  TABLE_EMPLOYEE_VERTICAL,
  TABLE_HORIZONTAL,
  TABLE_VERTICAL,
  createAnimationFromDb,
  isFloorTile,
} from './db';
import { drawSprite } from './draw';
import {
  Direction,
  Rect,
  Timer,
  createAdjacentIterArray,
  playSound,
  pointsEq,
  randInArr,
} from './utils';
import { getGame } from './game';
import { Point } from './utils';
import { Circle } from './utils';
import { createParticle } from './particle';
import { Actor, createActor } from './actor';
import { Animation } from './animation';
import { createPathArray, findPath } from './path';
import { Tile } from './room';
import { Item } from './item';
import { handleWallsAndDoors } from './player';

type PatronStatePerson = 'fs' | 'wfd' | 'd' | 'wfc' | 'l' | 'r' | 'n';

type PatronStateMole = 'fc' | 'dc' | 'ft' | 'dt' | 'lv';

export interface Patron extends Actor {
  type: 'person' | 'mole';
  getState(): PatronStatePerson | PatronStateMole;
  setPersonState(s: PatronStatePerson): void;
}

export const createPatron = (type: 'person' | 'mole', x: number, y: number) => {
  const actor = createActor();

  const walkTimer = new Timer(type === 'person' ? 150 : 300);
  const walkTimeoutTimer = new Timer(1000);
  let isWalkTimingOut = false;
  const patienceTimer = new Timer(20000);
  const drinkTimer = new Timer(3000);
  const fireTimer = new Timer(1000);
  const moleDestroyTimer = new Timer(2000);
  const waitForClearTimer = new Timer(100);
  let patronStatePerson: PatronStatePerson = 'fs';
  let patronStateMole: PatronStateMole = 'fc';
  let mugItem: Item | undefined = undefined;
  let mugPoint: Point | undefined = undefined;

  const anims: Record<string, Animation> = {};

  const getAnim = (animName: string) => {
    animName += '_l';
    if (!anims[animName]) {
      anims[animName] = createAnimationFromDb(animName);
    }
    return anims[animName];
  };

  const typeToAnim = (type: string): Animation => {
    if (type === 'person') {
      switch (patronStatePerson) {
        case 'fs':
        case 'd':
        case 'l':
          return getAnim('p_walk');
        case 'r':
          return getAnim('p_angry');
        case 'wfd':
          return patienceTimer.pct() < 0.5
            ? getAnim('p_wait')
            : getAnim('p2_wait');
        case 'wfc':
        case 'n':
          return getAnim('p_wait');
      }
    } else if (type === 'mole') {
      return getAnim('mole');
    }
    return getAnim('mole');
  };

  const setPersonState = (state: PatronStatePerson) => {
    patronStatePerson = state;
    if (state === 'wfd') {
      patienceTimer.start();
    }
    if (state === 'wfc') {
      waitForClearTimer.start();
    }
    if (state === 'r') {
      playSound('patronAngry');
    }
    if (state === 'l') {
      getGame().tileOrch.restoreTile(cl, 'Table');
    }
    typeToAnim('person').reset();
  };

  const setMoleState = (state: PatronStateMole) => {
    const game = getGame();
    patronStateMole = state;

    if (state === 'dc' || state === 'dt') {
      moleDestroyTimer.start();
    }

    if (state === 'fc') {
      game.tileOrch.restoreTile(cl, 'Crate');
      const tile = game.tileOrch.isTileAvailable('Crate');
      if (!tile) {
        setMoleState('ft');
      }
    }
    if (state === 'ft') {
      game.tileOrch.restoreTile(cl, 'MoleTable');
      const tile = game.tileOrch.isTileAvailable('MoleTable');
      if (!tile) {
        setMoleState('lv');
      }
    }
    if (state === 'lv') {
      game.tileOrch.restoreTile(cl, 'Crate');
      game.tileOrch.restoreTile(cl, 'MoleTable');
    }

    typeToAnim('mole').reset();
  };

  const walkTowardsTile = (tile: Tile, cb: () => void) => {
    const game = getGame();
    const point = tile.slice(1) as Point;
    const path = findPath(
      cl.getPos(),
      point,
      createPathArray(
        game.room,
        (game.patrons as Actor[]).concat([game.getPlayer()])
      ),
      game.room.w
    );

    const nextPoint = path[0];
    if (pointsEq(nextPoint, cl.getPos())) {
      cb();
    } else if (nextPoint) {
      const [x, y] = path[0];
      const prevPoint = cl.getPos();
      cl.x = x;
      cl.y = y;
      handleWallsAndDoors(cl, prevPoint, (tileId) => {
        const game = getGame();
        playSound('doorOpen');
        game.room.setTileAt(cl.x, cl.y, tileId + 1);
      });
    } else {
      if (isWalkTimingOut) {
        if (walkTimeoutTimer.isDone()) {
          isWalkTimingOut = false;
          for (const [_x, _y] of createAdjacentIterArray(cl.getPos())) {
            const tile = game.room.getTileAt(_x, _y);
            if (isFloorTile(tile[0])) {
              cl.x = _x;
              cl.y = _y;
            }
          }
        }
      } else {
        isWalkTimingOut = true;
        walkTimeoutTimer.start();
      }
    }
  };

  const updateWalkPosition = (type: string) => {
    const game = getGame();
    if (!walkTimer.isDone()) {
      return;
    }

    if (type === 'person') {
      switch (patronStatePerson) {
        case 'fs': {
          const tile = game.tileOrch.getAvailTile(cl, 'Table');
          if (tile) {
            walkTowardsTile(tile, () => {
              setPersonState('wfd');
            });
          }
          break;
        }
        case 'l': {
          const tile = game.tileOrch.getAvailTile(cl, 'Exit');
          if (tile) {
            walkTowardsTile(tile, () => {
              cl.remv = true;
            });
          }
        }
      }
    } else if (type === 'mole') {
      if (Math.random() > 0.9) {
        playSound('moleAlert');
      }

      switch (patronStateMole) {
        case 'fc': {
          const tile = game.tileOrch.getAvailTile(cl, 'Crate');
          if (tile) {
            walkTowardsTile(tile, () => {
              setMoleState('dc');
            });
          }
          break;
        }
        case 'ft': {
          const tile = game.tileOrch.getAvailTile(cl, 'MoleTable');
          if (tile) {
            walkTowardsTile(tile, () => {
              setMoleState('dt');
            });
          }
          break;
        }
        case 'lv': {
          const tile = game.tileOrch.getAvailTile(cl, 'Exit');
          if (tile) {
            walkTowardsTile(tile, () => {
              cl.remv = true;
            });
          }
        }
      }
    }

    walkTimer.start();
  };

  const updatePerson = () => {
    const game = getGame();
    updateWalkPosition('person');

    if (patronStatePerson === 'wfd' || patronStatePerson === 'r') {
      if (patienceTimer.isDone() && patronStatePerson !== 'r') {
        setPersonState('r');
        fireTimer.start();
      } else if (patronStatePerson === 'r') {
        if (fireTimer.isDone()) {
          if (Math.random() > 0.95) {
            game.setAdjTableOnFire(cl.getPos());
            fireTimer.start();
          }
        }
      }
      const adjItemResp = game.getAdjItem(cl.getPos());
      const adjItem = adjItemResp?.[0];
      if (adjItem?.name === 'mugF' && !adjItem?.remv) {
        adjItem.remv = true;
        mugItem = adjItem;
        mugPoint = adjItemResp?.[2] as Point;
        setPersonState('d');
        drinkTimer.start();
      }
    } else if (patronStatePerson === 'd') {
      if (drinkTimer.isDone() && mugItem && mugPoint) {
        setPersonState('wfc');
        mugItem.remv = false;
        mugItem.x = mugPoint[0];
        mugItem.y = mugPoint[1];
        mugItem.name = 'mugE';
        game.items.push(mugItem);
        mugItem = undefined;
      }
    } else if (patronStatePerson === 'wfc') {
      if (waitForClearTimer.isDone()) {
        if (game.room.isTileVisible(cl.x, cl.y)) {
          playSound('plusOne');
        }
        game.levelOrch.incScore();
        game.particles.push(createParticle('part_+1_l', 300, cl.x, cl.y));
        setPersonState('l');
      }
      // const itemOnGround = getGame().getItemAt(cl.x, cl.y);
      // if (!itemOnGround) {
      //   setPersonState('leaving');
      // }
    }
  };

  const updateMole = () => {
    const game = getGame();
    updateWalkPosition('mole');

    if (patronStateMole === 'dc' && moleDestroyTimer.isDone()) {
      const tile = game.getAdjTile(cl.getPos(), [CRATE]);
      if (tile) {
        playSound('dc');
        tile[0] = RUBBLE;
        setMoleState('fc');
      }
    }
    if (patronStateMole === 'dt' && moleDestroyTimer.isDone()) {
      const tile = game.getAdjTile(cl.getPos(), [
        TABLE_HORIZONTAL,
        TABLE_VERTICAL,
        TABLE_EMPLOYEE_HORIZONTAL,
        TABLE_EMPLOYEE_VERTICAL,
      ]);
      if (tile) {
        playSound('dc');
        tile[0] = RUBBLE;
        setMoleState('fc');
      }
    }
  };

  const cl: Patron = {
    ...actor,
    type,
    x,
    y,
    getState() {
      return type === 'person' ? patronStatePerson : patronStateMole;
    },
    setPersonState(s: PatronStatePerson) {
      setPersonState(s);
    },
    getPos: (): Point => {
      return [cl.x, cl.y];
    },
    update() {
      if (type === 'person') {
        updatePerson();
      } else if (type === 'mole') {
        updateMole();
      }
    },
    draw() {
      const anim = typeToAnim(type);
      anim.update();
      const sprite = anim.getSprite();

      // if (patronStatePerson

      drawSprite(sprite, cl.x * 16, cl.y * 16);

      if (patronStatePerson === 'd' && mugItem) {
        // drawSprite('mugFull', cl.x * 16, cl.y * 16);
        mugItem.drawAt(cl.x * 16 + 2, cl.y * 16 + 2);
      }
    },
  };
  return cl;
};
