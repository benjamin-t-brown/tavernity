import { Actor, createActor } from './actor';
import { drawSprite } from './draw';

export interface Item extends Actor {
  name: ItemName;
  drawAt: (x: number, y: number, flipped?: boolean) => void;
}

export type ItemName =
  | 'mugEmpty'
  | 'mugFull'
  | 'sword'
  | 'buoy'
  | 'hammer'
  | 'bucketFull';

export const itemNameToLabel = (itemName: ItemName): string => {
  const labels: Record<ItemName, string> = {
    mugEmpty: 'Empty Mug',
    mugFull: 'Full Mug',
    sword: 'Sword',
    buoy: 'Buoy',
    hammer: 'Hammer',
    bucketFull: 'Bucket',
  };
  return labels[itemName];
};

export const itemNameToSprite = (itemName: ItemName) => {
  return (
    (() => {
      switch (itemName) {
        case 'mugEmpty':
          return 's_30';
        case 'mugFull':
          return 's_29';
        case 'sword':
          return 's_31';
        case 'buoy':
          return 's_32';
        case 'bucketFull':
          return 's_34';
      }
    })() ?? 's_0'
  );
};

export const createItem = (itemName: ItemName, x: number, y: number) => {
  const actor = createActor();
  const cl: Item = {
    ...actor,
    name: itemName,
    x,
    y,
    draw() {
      if (cl.remv) {
        return;
      }
      const sprite = itemNameToSprite(cl.name);
      drawSprite(sprite, cl.x * 16, cl.y * 16);
    },
    drawAt(x, y, flipped?: boolean) {
      const sprite = itemNameToSprite(cl.name);
      drawSprite(sprite + (flipped ? '_f' : ''), x, y);
    },
  };

  return cl;
};
