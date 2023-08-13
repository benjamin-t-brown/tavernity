import { createAnimationFromDb } from './db';
import { drawSprite } from './draw';
import {
  Actor,
  Direction,
  Rect,
  Timer,
  createActor,
  playSound,
  randInArr,
} from './utils';
import { getGame } from './game';
import { Point } from './utils';
import { Circle } from './utils';
import { createParticle } from './particle';

type PatronState = 'findSeat' | 'waitForDrink' | 'drinking' | 'leaving' | 'rioting' | 'findMug' | 'none';

export interface Patron extends Actor {
  patronState: PatronState
}

export const createPatron = (
  type: 'person' | 'mole',
  x: number,
  y: number
) => {
  const actor = createActor();

  // let state: 'moving' | 'idle' = 'idle';
  const patienceTimer = new Timer(10000);
  patienceTimer.start();

  const cl: Patron = {
    ...actor,
    x,
    y,
    patronState: 'none',
    update() {

    },
    draw() {

    },
  };
  return cl;
};
