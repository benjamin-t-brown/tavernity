import { drawSprite, getCanvas, getSprite } from './draw';
import { Animation, createAnimation } from './animation';
import { getGame } from './game';
import { createParticle } from './particle';
import {
  Direction,
  Point,
  Timer,
  dirToOffsets,
  getModalText,
  isKeyDown,
  timeoutPromise,
} from './utils';
import { playSound } from './utils';
import { ItemName, itemNameToLabelObj } from './item';
import { createAnimationFromDb } from './db';
import { Actor, createActor } from './actor';

export interface Player extends Actor {
  dir: Direction;
  ctrlEnabled: boolean;
}
export const createPlayer = () => {
  const keyTimer1 = new Timer(300);
  const keyTimer2 = new Timer(75);
  let firstKeyPressed = false;

  window.addEventListener('keyup', (e) => {
    firstKeyPressed = false;
    console.log('complete timer');
    keyTimer1.complete();
  });

  const handleKeyUpdate = () => {
    const game = getGame();

    if (cl.ctrlEnabled) {
      if (keyTimer1.isDone() && keyTimer2.isDone()) {
        const { x, y } = cl;
        if (isKeyDown('ArrowUp')) {
          cl.y--;
        } else if (isKeyDown('ArrowDown')) {
          cl.y++;
        }

        if (isKeyDown('ArrowLeft')) {
          cl.x--;
        } else if (isKeyDown('ArrowRight')) {
          cl.x++;
        }

        if (cl.x !== x || cl.y !== y) {
          if (firstKeyPressed) {
            keyTimer2.start();
          } else {
            keyTimer1.start();
            keyTimer2.start();
            firstKeyPressed = true;
          }
        }
      }
    }
  };

  const cl: Player = Object.assign(createActor(), {
    dir: 'l' as Direction,
    x: 10,
    y: 8,
    ctrlEnabled: true,
    update() {
      handleKeyUpdate();
    },
    draw() {
      const game = getGame();
      drawSprite('s_0', cl.x * 16, cl.y * 16, game.scale);
    },
  });

  return cl;
};
