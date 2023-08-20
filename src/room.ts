import { createCanvas, drawRect, drawSprite } from './draw';
import { createPatron } from './patron';
import { getGame } from './game';
import { createItem } from './item';
import { at, getModalText } from './utils';
import { rand } from './zzfx';
import { createVisibilityMaps } from './flood';
import { Actor, createActor } from './actor';

export const ROOM_WIDTH_IN_TILES = 16;
export const ROOM_HEIGHT_IN_TILES = 16;

const tileIdToSprite = (tileId: number) => {
  return `s_${tileId + 12}}`;
};

export interface Room extends Actor {
  tiles: Tile[];
  visMaps: number[][];
  getTileAt: (x: number, y: number) => Tile;
  setTileAt: (x: number, y: number, tileId: number) => void;
  reset: () => void;
}

export type Tile = [number /*id*/, number /*tileX*/, number /*tileY*/];

export const createRoom = (tiles: number[], roomWidth: number): Room => {
  const cl: Room = {
    ...createActor(),
    visMaps: createVisibilityMaps(tiles, roomWidth),
    tiles: tiles.map((tileId, i) => [
      tileId,
      i % roomWidth,
      Math.floor(i / roomWidth),
    ]),
    getTileAt: (px: number, py: number) => {
      const tx = Math.floor(px / 16);
      const ty = Math.floor(py / 16);
      const tile = cl.tiles[ty * roomWidth + tx];
      return tile ?? [0];
    },
    setTileAt: (px: number, py: number, tileId: number) => {
      const tx = Math.floor(px / 16);
      const ty = Math.floor(py / 16);
      const t = cl.tiles[ty * roomWidth + tx];
      if (t) {
        t[0] = tileId;
      }
    },
    reset: () => {},
    draw: () => {
      const game = getGame();
      const player = game.getPlayer();
      const playerPos = player.getPos();

      // console.log('check vis map at', playerPos);

      const visMapInds: number[] = [];

      for (let visMapInd = 0; visMapInd < cl.visMaps.length; visMapInd++) {
        const visMap = cl.visMaps[visMapInd];
        const n = at(playerPos, visMap, roomWidth);
        if (n > 0) {
          visMapInds.push(visMapInd);
        }
      }

      for (let i = 0; i < roomWidth; i++) {
        for (let j = 0; j < roomWidth; j++) {
          const [tileId] = cl.tiles[j + i * roomWidth];
          const isVisible = visMapInds.reduce(
            (prev, curr) => prev || at([j, i], cl.visMaps[curr], roomWidth) > 0,
            false
          );
          if (tileId && isVisible) {
            drawSprite(
              's_' + (tileId - 1),
              j * 16 * game.scale,
              i * 16 * game.scale,
              game.scale
            );
          } else {
            drawRect(
              j * 16 * game.scale,
              i * 16 * game.scale,
              16 * game.scale,
              16 * game.scale,
              '#000'
            );
          }

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
