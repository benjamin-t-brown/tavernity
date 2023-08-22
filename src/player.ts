import { drawSprite, getCanvas, getSprite } from './draw';
import { Animation, createAnimation } from './animation';
import { AdjItem, getGame } from './game';
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
import { Item, ItemName } from './item';
import {
  KEG_TILES,
  TABLE_TILES,
  createAnimationFromDb,
  isClosedDoorTile,
  isWallTile,
} from './db';
import { Actor, createActor } from './actor';
import { Tile } from './room';

export interface Player extends Actor {
  dir: Direction;
  ctrlEnabled: boolean;
  itemLeft: Item | undefined;
  itemRight: Item | undefined;
}
export const createPlayer = () => {
  const keyPressTimer1 = new Timer(300);
  const keyPressTimer2 = new Timer(80);
  let firstKeyPressed = false;

  const handleWallsAndDoors = ([prevX, prevY]: Point) => {
    const game = getGame();
    const prevTileId = game.room.getTileAt(prevX, prevY)?.[0];
    const tileId = game.room.getTileAt(cl.x, cl.y)?.[0];
    if (isWallTile(tileId)) {
      if (isClosedDoorTile(tileId)) {
        playSound('doorOpen');
        game.room.setTileAt(cl.x, cl.y, tileId + 1);
        keyPressTimer1.start();
        firstKeyPressed = true;
      }
      cl.x = prevX;
      cl.y = prevY;
    } else {
      if (isClosedDoorTile(prevTileId - 1)) {
        playSound('doorClose');
        game.room.setTileAt(prevX, prevY, prevTileId - 1);
      }
    }
  };

  const handlePickupItem = (item: Item) => {
    item.remv = true;
    if (cl.itemLeft === undefined) {
      console.log('put item in left');
      playSound('item');
      cl.itemLeft = item;
    } else if (cl.itemRight === undefined) {
      playSound('item');
      cl.itemRight = item;
    } else {
      getGame().showWarning('Your hands are full!');
    }
  };

  const handlePutDownItemOnTable = (hand: 'Right' | 'Left', tile: Tile) => {
    const game = getGame();
    const itemKey = 'item' + hand;
    const item = cl[itemKey];
    playSound('itemPlace');
    item.remv = false;
    item.x = tile[1];
    item.y = tile[2];
    game.items.push(item);
    cl[itemKey] = undefined;
  };

  const handleFillMug = (mugItem: Item) => {
    playSound('fill');
    mugItem.name = 'mugFull';
  };

  const handleKeyUpdate = () => {
    if (cl.ctrlEnabled) {
      if (keyPressTimer1.isDone() && keyPressTimer2.isDone()) {
        const { x, y } = cl;
        let moved = false;
        if (isKeyDown('ArrowUp')) {
          cl.y--;
          moved = true;
        } else if (isKeyDown('ArrowDown')) {
          cl.y++;
          moved = true;
        }

        if (isKeyDown('ArrowLeft')) {
          cl.x--;
          moved = true;
        } else if (isKeyDown('ArrowRight')) {
          cl.x++;
          moved = true;
        }

        if (moved) {
          handleWallsAndDoors([x, y]);
          // playSound('step');
        }

        if (cl.x !== x || cl.y !== y) {
          if (firstKeyPressed) {
            keyPressTimer2.start();
          } else {
            keyPressTimer1.start();
            keyPressTimer2.start();
            firstKeyPressed = true;
          }
        }
      }
    }
  };

  window.addEventListener('keydown', (e) => {
    const game = getGame();
    if (e.key === ' ') {
      const adjItemResult = game.getAdjItem([cl.x, cl.y]);

      let localAdjTile: Tile | undefined;

      if (adjItemResult && (!cl.itemLeft || !cl.itemRight)) {
        console.log('pickup item');
        handlePickupItem(adjItemResult[0]);
      } else if (
        cl.itemLeft?.name === 'mugEmpty' &&
        game.getAdjTile([cl.x, cl.y], KEG_TILES)
      ) {
        handleFillMug(cl.itemLeft);
      } else if (
        cl.itemRight?.name === 'mugEmpty' &&
        game.getAdjTile([cl.x, cl.y], KEG_TILES)
      ) {
        handleFillMug(cl.itemRight);
      } else if (
        cl.itemRight &&
        (localAdjTile = game.getAdjTile([cl.x, cl.y], TABLE_TILES)) &&
        !game.getItemAt(localAdjTile[1], localAdjTile[2])
      ) {
        handlePutDownItemOnTable('Right', localAdjTile);
      } else if (
        cl.itemLeft &&
        (localAdjTile = game.getAdjTile([cl.x, cl.y], TABLE_TILES)) &&
        !game.getItemAt(localAdjTile[1], localAdjTile[2])
      ) {
        handlePutDownItemOnTable('Left', localAdjTile);
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    firstKeyPressed = false;
    keyPressTimer1.complete();
  });

  const cl: Player = Object.assign(createActor(), {
    dir: 'l' as Direction,
    x: 10,
    y: 8,
    itemLeft: undefined,
    itemRight: undefined,
    ctrlEnabled: true,
    update() {
      handleKeyUpdate();
    },
    draw() {
      let sprOffset = 0;
      if (cl.itemLeft) {
        sprOffset++;
      }
      if (cl.itemRight) {
        sprOffset++;
      }

      drawSprite('s_' + sprOffset, cl.x * 16, cl.y * 16);
      if (cl.itemLeft) {
        cl.itemLeft.drawAt(cl.x * 16 - 8, cl.y * 16 - 6, true);
      }
      if (cl.itemRight) {
        cl.itemRight.drawAt(cl.x * 16 + 8, cl.y * 16 - 6);
      }
    },
  });

  return cl;
};
