import { createCanvas, drawRect, drawSprite } from './draw';
import { createPatron } from './patron';
import { getGame } from './game';
import { createItem } from './item';
import { at, getModalText } from './utils';
import { rand } from './zzfx';
import { createVisibilityMaps } from './flood';
import { Actor, createActor } from './actor';

export interface Room extends Actor {
  w: number;
  h: number;
  tiles: Tile[];
  visMaps: number[][];
  visMapInds: number[];
  getTileAt: (x: number, y: number) => Tile;
  setTileAt: (x: number, y: number, tileId: number) => void;
  isTileVisible(x: number, y: number, visMapInds?: number[]): boolean;
  reset: () => void;
}

export type Tile = [number /*id*/, number /*tileX*/, number /*tileY*/];

export const createRoom = (tiles: number[], roomWidth: number): Room => {
  const calculateVisMapInds = () => {
    const game = getGame();
    const player = game.getPlayer();
    const playerPos = player.getPos();

    const visMapInds: number[] = [];

    for (let visMapInd = 0; visMapInd < cl.visMaps.length; visMapInd++) {
      const visMap = cl.visMaps[visMapInd];
      const n = at(playerPos, visMap, roomWidth);
      if (n > 0) {
        visMapInds.push(visMapInd);
      }
    }

    return visMapInds;
  };

  const cl: Room = {
    ...createActor(),
    w: roomWidth,
    h: roomWidth,
    visMaps: createVisibilityMaps(tiles, roomWidth),
    visMapInds: [],
    tiles: tiles.map((tileId, i) => [
      tileId,
      i % roomWidth,
      Math.floor(i / roomWidth),
    ]),
    getTileAt: (tx: number, ty: number) => {
      const tile = cl.tiles[ty * roomWidth + tx];
      return tile ?? [0];
    },
    setTileAt: (tx: number, ty: number, tileId: number) => {
      const t = cl.tiles[ty * roomWidth + tx];
      if (t) {
        t[0] = tileId;
      }
    },
    isTileVisible: (tx: number, ty: number) => {
      const isVisible = cl.visMapInds.reduce(
        (prev, curr) => prev || at([tx, ty], cl.visMaps[curr], roomWidth) > 0,
        false
      );
      return isVisible;
    },
    reset: () => {},
    update: () => {
      cl.visMapInds = calculateVisMapInds();
    },
    draw: () => {
      for (let i = 0; i < roomWidth; i++) {
        for (let j = 0; j < roomWidth; j++) {
          const [tileId] = cl.tiles[j + i * roomWidth];
          const isVisible = cl.isTileVisible(j, i, cl.visMapInds);
          if (tileId && isVisible) {
            drawSprite('s_' + (tileId - 1), j * 16, i * 16);
          } else {
            drawRect(j * 16, i * 16, 16, 16, '#000');
          }
        }
      }
    },
  };

  const findTile = (arr: Tile[], searchTileId: number) => {
    return arr.find(([tileId]) => tileId === searchTileId) as Tile;
  };

  return cl;
};
