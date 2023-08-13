import { createCanvas, drawSprite } from './draw';
import { createPatron } from './patron';
import { getGame } from './game';
import { createItem } from './item';
import { Actor, createActor, getModalText, hexToRgbA } from './utils';
import { rand } from './zzfx';

export const ROOM_WIDTH_IN_TILES = 16;
export const ROOM_HEIGHT_IN_TILES = 16;

export interface Room extends Actor {
  roomNum: number;
  tiles: Tile[];
  getTileAt: (x: number, y: number) => Tile;
  setTileAt: (x: number, y: number, tileId: number) => void;
  reset: () => void;
}

export type Tile = [
  number /*id*/,
  number /*tileX*/,
  number /*tileY*/
];

export const createRoom = (roomNum: number): Room => {
  let roomW = ROOM_WIDTH_IN_TILES;
  let roomH = ROOM_HEIGHT_IN_TILES;
  // if (roomNum !== 0) {
  //   roomW = SUB_ROOM_WIDTH_IN_TILES;
  //   roomH = SUB_ROOM_HEIGHT_IN_TILES;
  // }

  const game = getGame();

  const cl: Room = {
    roomNum,
    ...createActor(),
    tiles: [],
    getTileAt: (px: number, py: number) => {
      const tx = Math.floor(px / 16);
      const ty = Math.floor(py / 16);
      const tile = cl.tiles[ty * roomW + tx];
      return tile ?? [0];
    },
    setTileAt: (px: number, py: number, tileId: number) => {
      const tx = Math.floor(px / 16);
      const ty = Math.floor(py / 16);
      const t = cl.tiles[ty * roomW + tx];
      if (t) {
        t[0] = tileId;
      }
    },
    getRect: () => [0, 0, roomW, roomH],
    reset: () => {

    },
    draw: () => {
      for (let i = 0; i < roomH; i++) {
        for (let j = 0; j < roomW; j++) {
          // drawSprite(`t1_${tileId}`, j * 16, i * 16, 1);
        }
      }
    },
  };

  const findTile = (arr: Tile[], searchTileId: number) => {
    return arr.find(([tileId]) => tileId === searchTileId) as Tile;
  };

  return cl;
};
