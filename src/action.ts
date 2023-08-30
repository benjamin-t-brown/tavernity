import {
  KEG_TILES,
  OUTSIDE_WELL,
  RUBBLE,
  TABLE_TILES,
  WEAPON_RACK,
} from './db';
import { Game } from './game';
import { Item } from './item';
import { Tile } from './room';
import { createAdjacentIterArray } from './utils';

type ActionType =
  | 'pickup-left'
  | 'pickup-right'
  | 'pickup-weapon'
  | 'putdown-left'
  | 'putdown-right'
  | 'fill-left'
  | 'fill-right'
  | 'swing-weapon'
  | 'putdown-weapon'
  | 'pickup-bucket'
  | 'dump-bucket'
  | 'repair';

export const ACTION_PICKUP_LEFT = 'pickup-left';
export const ACTION_PICKUP_RIGHT = 'pickup-right';
export const ACTION_PICKUP_WEAPON = 'pickup-weapon';
export const ACTION_PICKUP_BUCKET = 'pickup-bucket';
export const ACTION_PUTDOWN_LEFT = 'putdown-left';
export const ACTION_PUTDOWN_RIGHT = 'putdown-right';
export const ACTION_FILL_LEFT = 'fill-left';
export const ACTION_FILL_RIGHT = 'fill-right';
export const ACTION_SWING_WEAPON = 'swing-weapon';
export const ACTION_PUTDOWN_WEAPON = 'putdown-weapon';
export const ACTION_DUMP_BUCKET = 'dump-bucket';
export const ACTION_REPAIR = 'repair';

interface ActionResult {
  type: ActionType;
  tile?: Tile;
  item?: Item;
}

export const getAvailableAction = (game: Game): ActionResult | undefined => {
  const player = game.getPlayer();
  const adjItemResult = game.getAdjItem([player.x, player.y]);
  let localAdjTile: Tile | undefined;

  if (player.itemLeft?.name === 'sword') {
    localAdjTile = game.getAdjTile([player.x, player.y], [WEAPON_RACK]);
    if (localAdjTile) {
      return {
        type: ACTION_PUTDOWN_WEAPON,
      };
    } else {
      return {
        type: ACTION_SWING_WEAPON,
      };
    }
  }
  if (player.itemLeft?.name === 'bucketFull') {
    localAdjTile = game.getAdjTile([player.x, player.y], [OUTSIDE_WELL]);
    if (localAdjTile) {
      return {
        type: ACTION_PICKUP_BUCKET,
      };
    } else {
      return {
        type: ACTION_DUMP_BUCKET,
      };
    }
  }

  if ((localAdjTile = game.getAdjTile([player.x, player.y], [RUBBLE]))) {
    return {
      type: ACTION_REPAIR,
      tile: localAdjTile,
    };
  } else if (adjItemResult && (!player.itemLeft || !player.itemRight)) {
    const [item, , [x, y]] = adjItemResult;
    // if it's a full mug with an adjacent PersonPatron who is thirsty, then don't allow pickup
    if (adjItemResult[0].name === 'mugFull') {
      for (const [_x, _y] of createAdjacentIterArray([x, y])) {
        const patron = game.getPatronAt(_x, _y);
        if (patron?.getState() === 'waitForDrink') {
          return;
        }
      }
    }

    return {
      type: player.itemLeft ? ACTION_PICKUP_RIGHT : ACTION_PICKUP_LEFT,
      item,
    };
  } else if (
    !player.itemLeft &&
    !player.itemRight &&
    (localAdjTile = game.getAdjTile([player.x, player.y], [WEAPON_RACK]))
  ) {
    return {
      type: ACTION_PICKUP_WEAPON,
      tile: localAdjTile,
    };
  } else if (
    !player.itemLeft &&
    !player.itemRight &&
    (localAdjTile = game.getAdjTile([player.x, player.y], [OUTSIDE_WELL]))
  ) {
    return {
      type: ACTION_PICKUP_BUCKET,
      tile: localAdjTile,
    };
  } else if (
    player.itemLeft?.name === 'mugEmpty' &&
    game.getAdjTile([player.x, player.y], KEG_TILES)
  ) {
    return {
      type: ACTION_FILL_LEFT,
      item: player.itemLeft,
    };
  } else if (
    player.itemRight?.name === 'mugEmpty' &&
    game.getAdjTile([player.x, player.y], KEG_TILES)
  ) {
    return {
      type: ACTION_FILL_RIGHT,
      item: player.itemRight,
    };
  } else if (
    player.itemRight &&
    !['sword'].includes(player.itemRight.name) &&
    (localAdjTile = game.getAdjTile([player.x, player.y], TABLE_TILES)) &&
    !game.getItemAt(localAdjTile[1], localAdjTile[2])
  ) {
    return {
      type: ACTION_PUTDOWN_RIGHT,
      tile: localAdjTile,
      item: player.itemRight,
    };
  } else if (
    player.itemLeft &&
    !['sword'].includes(player.itemLeft.name) &&
    (localAdjTile = game.getAdjTile([player.x, player.y], TABLE_TILES)) &&
    !game.getItemAt(localAdjTile[1], localAdjTile[2])
  ) {
    return {
      type: ACTION_PUTDOWN_LEFT,
      tile: localAdjTile,
      item: player.itemLeft,
    };
  }
};
