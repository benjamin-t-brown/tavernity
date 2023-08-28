import {
  CRATE,
  ON_FIRE,
  RUBBLE,
  TABLE_EMPLOYEE_HORIZONTAL,
  TABLE_EMPLOYEE_VERTICAL,
  TABLE_HORIZONTAL,
  TABLE_VERTICAL,
  createAnimationFromDb,
} from './db';
import { drawSprite } from './draw';
import {
  Direction,
  Rect,
  Timer,
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

type PatronStatePerson =
  | 'findSeat'
  | 'waitForDrink'
  | 'drinking'
  | 'waitForClear'
  | 'leaving'
  | 'rioting'
  | 'findMug'
  | 'none';

type PatronStateMole =
  | 'findCrate'
  | 'destroyCrate'
  | 'findTable'
  | 'destroyTable'
  | 'leaving';

export interface Patron extends Actor {
  type: 'person' | 'mole';
  getState(): PatronStatePerson | PatronStateMole;
}

export const createPatron = (type: 'person' | 'mole', x: number, y: number) => {
  const actor = createActor();

  const walkTimer = new Timer(type === 'person' ? 200 : 400);
  const patienceTimer = new Timer(10000);
  const drinkTimer = new Timer(3000);
  const fireTimer = new Timer(1000);
  const moleDestroyTimer = new Timer(2000);
  const waitForClearTimer = new Timer(100);
  let patronStatePerson: PatronStatePerson = 'findSeat';
  let patronStateMole: PatronStateMole = 'findCrate';
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
        case 'findSeat':
        case 'drinking':
        case 'leaving':
          return getAnim('p_walk');
        case 'rioting':
          return getAnim('p_angry');
        case 'waitForDrink':
        case 'waitForClear':
        case 'none':
          return getAnim('p_wait');
      }
    } else if (type === 'mole') {
      return getAnim('mole');
    }
    return getAnim('mole');
  };

  const setPersonState = (state: PatronStatePerson) => {
    patronStatePerson = state;
    if (state === 'waitForDrink') {
      patienceTimer.start();
    }
    if (state === 'waitForClear') {
      waitForClearTimer.start();
    }
    if (state === 'rioting') {
      // playSound('patronAngry');
    }
    if (state === 'leaving') {
      getGame().tileOrch.restoreTile(cl, 'Table');
    }
    typeToAnim('person').reset();
  };

  const setMoleState = (state: PatronStateMole) => {
    const game = getGame();
    patronStateMole = state;

    if (state === 'destroyCrate' || state === 'destroyTable') {
      moleDestroyTimer.start();
    }

    if (state === 'findCrate') {
      game.tileOrch.restoreTile(cl, 'Crate');
      const tile = game.tileOrch.isTileAvailable('Crate');
      if (!tile) {
        setMoleState('findTable');
      }
    }
    if (state === 'findTable') {
      game.tileOrch.restoreTile(cl, 'MoleTable');
      const tile = game.tileOrch.isTileAvailable('MoleTable');
      if (!tile) {
        console.log('set mole leaving');
        setMoleState('leaving');
      }
    }
    if (state === 'leaving') {
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
    }
  };

  const updateWalkPosition = (type: string) => {
    const game = getGame();
    if (!walkTimer.isDone()) {
      return;
    }

    if (type === 'person') {
      switch (patronStatePerson) {
        case 'findSeat': {
          const tile = game.tileOrch.getAvailTile(cl, 'Table');
          if (tile) {
            walkTowardsTile(tile, () => {
              setPersonState('waitForDrink');
            });
          }
          break;
        }
        case 'leaving': {
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
        case 'findCrate': {
          const tile = game.tileOrch.getAvailTile(cl, 'Crate');
          if (tile) {
            walkTowardsTile(tile, () => {
              setMoleState('destroyCrate');
            });
          }
          break;
        }
        case 'findTable': {
          const tile = game.tileOrch.getAvailTile(cl, 'MoleTable');
          if (tile) {
            walkTowardsTile(tile, () => {
              setMoleState('destroyTable');
            });
          }
          break;
        }
        case 'leaving': {
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

    if (
      patronStatePerson === 'waitForDrink' ||
      patronStatePerson === 'rioting'
    ) {
      if (patienceTimer.isDone() && patronStatePerson !== 'rioting') {
        setPersonState('rioting');
        fireTimer.start();
      } else if (patronStatePerson === 'rioting') {
        if (fireTimer.isDone()) {
          if (Math.random() > 0.9) {
            game.setAdjTableOnFire(cl.getPos());
            fireTimer.start();
          }
        }
      }
      const adjItemResp = game.getAdjItem(cl.getPos());
      const adjItem = adjItemResp?.[0];
      if (adjItem?.name === 'mugFull' && !adjItem?.remv) {
        adjItem.remv = true;
        mugItem = adjItem;
        mugPoint = adjItemResp?.[2] as Point;
        setPersonState('drinking');
        drinkTimer.start();
      }
    } else if (patronStatePerson === 'drinking') {
      if (drinkTimer.isDone() && mugItem && mugPoint) {
        setPersonState('waitForClear');
        mugItem.remv = false;
        mugItem.x = mugPoint[0];
        mugItem.y = mugPoint[1];
        mugItem.name = 'mugEmpty';
        game.items.push(mugItem);
        mugItem = undefined;
      }
    } else if (patronStatePerson === 'waitForClear') {
      if (waitForClearTimer.isDone()) {
        if (game.room.isTileVisible(cl.x, cl.y)) {
          playSound('plusOne');
        }
        game.particles.push(createParticle('part_+1_l', 300, cl.x, cl.y));
        setPersonState('leaving');
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

    if (patronStateMole === 'destroyCrate' && moleDestroyTimer.isDone()) {
      const tile = game.getAdjTile(cl.getPos(), [CRATE]);
      if (tile) {
        playSound('destroyCrate');
        tile[0] = RUBBLE;
        setMoleState('findCrate');
      }
    }
    if (patronStateMole === 'destroyTable' && moleDestroyTimer.isDone()) {
      const tile = game.getAdjTile(cl.getPos(), [
        TABLE_HORIZONTAL,
        TABLE_VERTICAL,
        TABLE_EMPLOYEE_HORIZONTAL,
        TABLE_EMPLOYEE_VERTICAL,
      ]);
      if (tile) {
        playSound('destroyCrate');
        tile[0] = RUBBLE;
        setMoleState('findCrate');
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
      drawSprite(sprite, cl.x * 16, cl.y * 16);

      if (patronStatePerson === 'drinking' && mugItem) {
        // drawSprite('mugFull', cl.x * 16, cl.y * 16);
        mugItem.drawAt(cl.x * 16 + 2, cl.y * 16 + 2);
      }
    },
  };
  return cl;
};
