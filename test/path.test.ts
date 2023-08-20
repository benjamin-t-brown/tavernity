import { it, describe, expect } from 'vitest';
import { createRoom } from '../src/room';
import { createPathArray, findPath } from '../src/path';
import { FLOOR_TILES } from '../src/db';

// const printArr = (arr: number[], w: number) => {
//   let str = '';
//   for (let i = 0; i < w; i++) {
//     for (let j = 0; j < w; j++) {
//       const v = arr[j + i * w];
//       str += ' ';
//       if (v >= 0) {
//         str += ' ';
//       }
//       str += v + ',';
//     }
//     str += '\n';
//   }

//   console.log(str);
// };
describe('Path', () => {
  it('A basic path is correctly calculated', () => {
    // prettier-ignore
    const tiles = [
      0, 0, 1, 1, 1,
      1, 0, 0, 0, 0,
      1, 0, 1, 1, 1,
      0, 0, 0, 0, 1,
      0, 0, 1, 0, 0
    ].map(t => t === 0 ? FLOOR_TILES[0] : 1);

    const room = createRoom(tiles, 5);
    const pathArray = createPathArray(room, []);
    const path = findPath([0, 0], [4, 4], pathArray, 5);

    expect(path).toEqual([
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
      [2, 3],
      [3, 3],
      [3, 4],
      [4, 4],
    ]);
  });

  it('Handles impossible paths', () => {
    // prettier-ignore
    const tiles = [
      0, 0, 1, 1, 1,
      1, 0, 0, 0, 0,
      1, 1, 1, 1, 1,
      0, 0, 0, 0, 1,
      0, 0, 1, 0, 0
    ].map(t => t === 0 ? FLOOR_TILES[0] : 1);

    const room = createRoom(tiles, 5);
    const pathArray = createPathArray(room, []);
    const path = findPath([0, 0], [4, 4], pathArray, 5);

    expect(path).toEqual([]);
  });

  it('Handles paths of size 1', () => {
    // prettier-ignore
    const tiles = [
      0, 0, 1, 1, 1,
      1, 0, 0, 0, 0,
      1, 1, 1, 1, 1,
      0, 0, 0, 0, 1,
      0, 0, 1, 0, 0
    ].map(t => t === 0 ? FLOOR_TILES[0] : 1);

    const room = createRoom(tiles, 5);
    const pathArray = createPathArray(room, []);
    const path = findPath([0, 0], [1, 0], pathArray, 5);

    expect(path).toEqual([[1, 0]]);
  });

  it('Handles paths of size 0', () => {
    // prettier-ignore
    const tiles = [
      0, 0, 1, 1, 1,
      1, 0, 0, 0, 0,
      1, 1, 1, 1, 1,
      0, 0, 0, 0, 1,
      0, 0, 1, 0, 0
    ].map(t => t === 0 ? FLOOR_TILES[0] : 1);

    const room = createRoom(tiles, 5);
    const pathArray = createPathArray(room, []);
    const path = findPath([0, 0], [0, 0], pathArray, 5);

    expect(path).toEqual([[0, 0]]);
  });
});
