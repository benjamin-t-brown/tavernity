import { Particle, createParticle } from './particle';
import { Player, createPlayer } from './player';
import {
  Point,
  Timer,
  createAdjacentIterArray,
  isKeyDown,
  playSound,
} from './utils';
import { Room, Tile, createRoom } from './room';
import { drawRect, drawSprite, drawText, getCanvas, getCtx } from './draw';
import {
  Item,
  ItemName,
  createItem,
  itemNameToLabel,
  itemNameToSprite,
} from './item';
import { getModalText } from './utils';
import { rand } from './zzfx';
import { Actor } from './actor';

export type AdjItem = [Item, number /* number of items*/];

export interface Game {
  cx: number;
  cy: number;
  scale: number;
  room: Room;
  items: Item[];
  getPlayer: () => Player;
  getItemAt: (x: number, y: number) => Item | undefined;
  getAdjTile: ([x, y]: Point, tileIds: number[]) => Tile | undefined;
  getAdjItem: (p: Point) => AdjItem | undefined;
  showWarning: (text: string) => void;
  setup: () => void;
  update: (fm: number) => void;
  draw: () => void;
}

export const getGame = (): Game => {
  return (window as any).game;
};

export function createGame(tiles: number[], mapWidth: number, spawns: Point[]) {
  let player: Player;
  const room: Room = createRoom(tiles, mapWidth);

  const keyInfo = document.getElementById('key-info') as HTMLDivElement;
  const pickUpNotif = keyInfo.children[0] as HTMLDivElement;
  const warnNotif = keyInfo.children[1] as HTMLDivElement;
  let lastAdjItem: Item | undefined;

  const warningTimer = new Timer(2000);

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
      if (cl.room.isTileVisible(a.x, a.y)) {
        a.draw();
      }
    }
  };

  const cl: Game = {
    cx: 0,
    cy: 0,
    scale: 4,
    room,
    items: [],
    setup() {
      console.log('setup');
      player = (window as any).player = createPlayer();
      if (cl.room) {
        cl.room.reset();
      }

      cl.items.push(createItem('mugEmpty', 5, 7));
      cl.items.push(createItem('mugEmpty', 6, 7));
      cl.items.push(createItem('mugEmpty', 7, 7));
    },
    getPlayer() {
      return player;
    },
    getItemAt(x: number, y: number) {
      return cl.items.find((i) => i.x === x && i.y === y);
    },
    getAdjTile([x, y]: Point, tileIds: number[]) {
      for (const tileId of tileIds) {
        for (const [_x, _y] of createAdjacentIterArray([x, y])) {
          const tile = cl.room.getTileAt(_x, _y);
          if (tile && tile[0] === tileId) {
            return tile;
          }
        }
      }
    },
    getAdjItem([x, y]: Point) {
      let ctr = 0;
      let lastItem: Item | undefined;
      for (const item of cl.items) {
        for (const [_x, _y] of createAdjacentIterArray([x, y])) {
          if (item.x === _x && item.y === _y) {
            if (!lastItem || lastItem.name === item.name) {
              ctr++;
              lastItem = item;
            }
          }
        }
      }
      if (lastItem) {
        return [lastItem, ctr];
      }
    },
    showWarning(text: string) {
      warnNotif.style.opacity = '1';
      warnNotif.innerHTML = text;
      warningTimer.start();
    },
    update(fm: number) {
      room.update();
      updateActorArray(cl.items);
      player.update();

      const canvas = getCanvas();
      cl.cx = player.x * 16 * cl.scale - canvas.width / 2 + 8 * cl.scale;
      cl.cy = player.y * 16 * cl.scale - canvas.height / 2 + 8 * cl.scale;
    },
    draw() {
      const ctx = getCtx();

      ctx.save();
      ctx.translate(-cl.cx, -cl.cy);
      ctx.scale(cl.scale, cl.scale);

      cl.room.draw();
      drawActorArray(cl.items);
      player.draw();

      const adjItemResult = cl.getAdjItem([player.x, player.y]);
      if (adjItemResult) {
        const [item] = adjItemResult;
        if (lastAdjItem !== item) {
          pickUpNotif.style.opacity = '1';
          const label = `Pick up ${itemNameToLabel(item.name)} (Space)`;
          pickUpNotif.innerHTML = label;
          lastAdjItem = item;
        }
      } else {
        lastAdjItem = undefined;
        pickUpNotif.style.opacity = '0';
      }

      if (warningTimer.isDone()) {
        warnNotif.style.opacity = '0';
      }

      ctx.restore();
    },
  };

  (window as any).game = cl;

  cl.setup();

  return cl;
}
