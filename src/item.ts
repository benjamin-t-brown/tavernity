import { Actor, createActor } from './actor';
import { drawSprite } from './draw';

export interface Item extends Actor {
  name: ItemName;
}

export type ItemName =
  | 'mugEmpty'
  | 'mugFull'
  | 'sword'
  | 'buoy'
  | 'hammer'
  | 'bucketFull';

export const itemNameToLabelObj = (itemName: ItemName): string => {
  const labels: Record<ItemName, string> = {
    mugEmpty: 'Mug',
    mugFull: 'Mug',
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
          return 's_29';
        case 'mugFull':
          return 's_30';
        case 'sword':
          return 's_31';
        case 'buoy':
          return 's_32';
        case 'bucketFull':
          return 's_33';
      }
    })() ?? 's_0'
  );
};

export const createItem = (itemName: ItemName, x: number, y: number) => {
  const sprite = itemNameToSprite(itemName);
  const actor = createActor();
  const cl: Item = {
    ...actor,
    name: itemName,
    x,
    y,
    draw() {
      drawSprite(sprite, cl.x, cl.y, cl.scale);
    },
  };

  return cl;
};
