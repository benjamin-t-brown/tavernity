import { Room } from './room';
import { Point, at } from './utils';
import { isWallTile } from './db';
import { Actor } from './actor';

interface PfTile {
  parent?: PfTile;
  p: Point;
}

export const createPathArray = (room: Room, actors: Actor[]) => {
  const arr: number[] = [];

  const findActorAt = ([x, y]: Point) => {
    return actors.find((a) => a.x === x && a.y === y);
  };

  for (const [id, x, y] of room.tiles) {
    if (isWallTile(id) || findActorAt([x, y])) {
      arr.push(0);
    } else {
      arr.push(1);
    }
  }

  return arr;
};

const pointsEq = (p1: Point, p2: Point) => {
  // return '' + p1 === '' + p2;
  return p1[0] === p2[0] && p1[1] === p2[1];
};

const checkAddIf = (
  p: Point,
  parent: PfTile,
  pathArray: number[],
  width: number,
  tilesChecked: Point[],
  tilesToCheck: PfTile[]
) => {
  const isTraversable = at(p, pathArray, width) === 1;
  if (isTraversable && !tilesChecked.find((t) => pointsEq(t, p))) {
    tilesToCheck.push({
      p,
      parent,
    });
  }
};

export const findPath = (
  startLoc: Point,
  endLoc: Point,
  pathArray: number[],
  width: number
): Point[] => {
  const path: Point[] = [];

  // return [];

  const tilesToCheck: PfTile[] = [{ p: startLoc }];
  const tilesChecked: Point[] = [];

  while (tilesToCheck.length) {
    const pfTile = tilesToCheck.shift();
    if (!pfTile) {
      return [];
    }

    if (pointsEq(pfTile.p, endLoc)) {
      path.unshift(endLoc);
      let nextParent = pfTile.parent;
      while (nextParent) {
        if (nextParent.parent) {
          path.unshift(nextParent.p);
        }
        nextParent = nextParent.parent;
      }
      break;
    }

    tilesChecked.push(pfTile.p);
    const [x, y] = pfTile.p;

    checkAddIf(
      [x - 1, y],
      pfTile,
      pathArray,
      width,
      tilesChecked,
      tilesToCheck
    );
    checkAddIf(
      [x + 1, y],
      pfTile,
      pathArray,
      width,
      tilesChecked,
      tilesToCheck
    );
    checkAddIf(
      [x, y - 1],
      pfTile,
      pathArray,
      width,
      tilesChecked,
      tilesToCheck
    );
    checkAddIf(
      [x, y + 1],
      pfTile,
      pathArray,
      width,
      tilesChecked,
      tilesToCheck
    );
    // }
  }

  return path;
};
