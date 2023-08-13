import { drawSprite } from './draw';
import { Actor, createActor } from './utils';

export interface Item extends Actor {
  name: ItemName;
}

export type ItemName =
  | 'mugEmpty'
  | 'mugFull'
  | 'sword'
  | 'buoy'
  | 'hammer'
  | 'bucketFull'

export const itemNameToLabelObj = (
  itemName: ItemName
): string => {
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
        case 'mugFull':
        case 'sword':
        case 'buoy':
        case 'bucketFull':
          return 's_0';
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
    getRect: () => [cl.x, cl.y, cl.x + 16, cl.y + 16],
    draw() {
      drawSprite(sprite, cl.x, cl.y, cl.scale);
    },
  };

  return cl;
};
