import { Particle, createParticle } from './particle';
import { Player, createPlayer } from './player';
import {
  Actor,
  Timer,
  isKeyDown,
  isPointInRect,
  playSound,
  rectRectCollision,
} from './utils';
import {
  ROOM_HEIGHT_IN_TILES,
  ROOM_WIDTH_IN_TILES,
  Room,
  createRoom,
} from './room';
import {
  drawRect,
  drawSprite,
  drawText,
  finishDrawing,
  getCanvas,
  getCtx,
  setupDrawing,
} from './draw';
import { Item, ItemName, createItem, itemNameToSprite } from './item';
import { getModalText } from './utils';
import { rand } from './zzfx';

export interface Game {
  cx: number;
  cy: number;
  room: Room;
  getPlayer: () => Player;
  setup: () => void;
  update: (fm: number) => void;
  draw: () => void;
}

export const getGame = (): Game => {
  return (window as any).game;
};

export function createGame() {
  let player: Player;

  const updateActorArray = (arr: Actor[]) => {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      a.update();
      if (a.remv) {
        arr.splice(i, 1);
        i--;
      }
    }
  };

  const drawActorArray = (arr: Actor[]) => {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      a.draw();
    }
  };

  const cl: Game = {
    cx: 0,
    cy: 0,
    room: null as any,
    setup() {
      player = (window as any).player = createPlayer();
      if (cl.room) {
        cl.room.reset();
      }
    },
    getPlayer(){
      return player;
    },
    update(fm: number) {

    },
    draw() {
      const canvas = getCanvas();
      const ctx = getCtx();
      let scale = 4;
     
    },
  };

  (window as any).game = cl;

  cl.setup();

  return cl;
}
