import { drawSprite, getCanvas, getSprite } from './draw';
import { Animation, createAnimation } from './animation';
import { getGame } from './game';
import { createParticle } from './particle';
import {
  Actor,
  Direction,
  Point,
  Timer,
  createActor,
  dirToOffsets,
  getAngleTowards,
  getModalText,
  isKeyDown,
  timeoutPromise,
} from './utils';
import { playSound } from './utils';
import { ItemName, itemNameToLabelObj } from './item';
import { createAnimationFromDb } from './db';

export interface Player extends Actor {
  dir: Direction;
  ctrlEnabled: boolean;
}
export const createPlayer = () => {
  const handleKeyUpdate = () => {
    const game = getGame();

    if (cl.ctrlEnabled) {
      if (isKeyDown('ArrowUp')) {

      } else if (isKeyDown('ArrowDown')) {

      }

      if (isKeyDown('ArrowLeft')) {

      } else if (isKeyDown('ArrowRight')) {

      }
    }
  };

  const cl: Player = {
    ...createActor(),
    dir: 'l',
    ctrlEnabled: true,
    update() {
      
    },
    draw() {

    },
  };

  return cl;
};
