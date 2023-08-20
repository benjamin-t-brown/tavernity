import { it, describe, expect } from 'vitest';
import { createVisibilityMaps } from '../src/flood';
import { FLOOR_TILES } from '../src/db';
describe('Flood', () => {
  it('The visibility maps can be created with a flood fill', () => {
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

    // prettier-ignore
    const tiles = [
      1, 1, 1, 1, 1,
      1, 0, 0, 1, 0,
      1, 1, 1, 1, 1,
      0, 0, 0, 0, 0,
      0, 0, 1, 0, 0
    ].map(t => t === 0 ? FLOOR_TILES[0] : 1);

    const rooms = createVisibilityMaps(tiles, 5);

    // for (const room of rooms) {
    //   printArr(room, 5);
    // }
    // prettier-ignore
    const room1 = [
      1,  1,  1,  1,  0,
      1,  1,  1,  1,  0,
      1,  1,  1,  1,  0,
      0,  0,  0,  0,  0,
      0,  0,  0,  0,  0,
    ];
    // prettier-ignore
    const room2 = [
      0,  0,  0,  2,  2,
      0,  0,  0,  2,  2,
      0,  0,  0,  2,  2,
      0,  0,  0,  0,  0,
      0,  0,  0,  0,  0,
    ]
    // prettier-ignore
    const room3 = [
      0,  0,  0,  0,  0,
      0,  0,  0,  0,  0,
      3,  3,  3,  3,  3,
      3,  3,  3,  3,  3,
      3,  3,  3,  3,  3,
    ]

    expect(rooms.length).toEqual(3);
    expect(rooms[0]).toEqual(room1);
    expect(rooms[1]).toEqual(room2);
    expect(rooms[2]).toEqual(room3);
  });
});
