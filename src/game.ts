import { Particle, createParticle } from './particle';
import { Player, createPlayer } from './player';
import {
  Point,
  Timer,
  createAdjacentIterArray,
  isKeyDown,
  playSound,
} from './utils';
import { Room, Tile, createRoom } from './room';
import { drawRect, drawSprite, drawText, getCanvas, getCtx } from './draw';
import {
  Item,
  ItemName,
  createItem,
  itemNameToLabel,
  itemNameToSprite,
} from './item';
import { getModalText } from './utils';
import { rand } from './zzfx';
import { Actor } from './actor';
import { TileOrchestrator, createTileOrchestrator } from './tileOrchestrator';
import { Patron, createPatron } from './patron';
import {
  ACTION_FILL_LEFT,
  ACTION_FILL_RIGHT,
  ACTION_PICKUP_BUCKET,
  ACTION_PICKUP_LEFT,
  ACTION_PICKUP_RIGHT,
  ACTION_PICKUP_WEAPON,
  ACTION_PUTDOWN_LEFT,
  ACTION_PUTDOWN_RIGHT,
  ACTION_PUTDOWN_WEAPON,
  ACTION_REPAIR,
  getAvailableAction,
} from './action';
import { createSpawnOrchestrator } from './spawnOrchestrator';
import { ON_FIRE, TABLE_HORIZONTAL, TABLE_VERTICAL } from './db';

export type AdjItem = [Item, number /* number of items*/, Point];

export interface Game {
  cx: number;
  cy: number;
  scale: number;
  room: Room;
  tileOrch: TileOrchestrator;
  items: Item[];
  patrons: Patron[];
  particles: Particle[];
  fParticles: Particle[];
  setAdjTableOnFire: (pos: Point) => void;
  getPlayer: () => Player;
  getItemAt: (x: number, y: number) => Item | undefined;
  getPatronAt: (x: number, y: number) => Patron | undefined;
  getAdjTile: ([x, y]: Point, tileIds: number[]) => Tile | undefined;
  getAdjItem: (p: Point) => AdjItem | undefined;
  showWarning: (text: string) => void;
  setup: () => void;
  update: (fm: number) => void;
  draw: () => void;
}

export const getGame = (): Game => {
  return (window as any).game;
};

export function createGame(tiles: number[], mapWidth: number, spawns: Point[]) {
  const room: Room = createRoom(tiles, mapWidth, spawns);
  const spawnOrch = createSpawnOrchestrator();
  const menuTimer = new Timer(1000);
  let menuBlink = false;

  const keyInfo = document.getElementById('key-info') as HTMLDivElement;
  const pickUpNotif = keyInfo.children[0] as HTMLDivElement;
  const warnNotif = keyInfo.children[1] as HTMLDivElement;
  let lastLabel = '';

  const player = ((window as any).player = createPlayer());

  let menu = true;

  const warningTimer = new Timer(2000);

  window.addEventListener('keydown', (e) => {
    if (e.key === ' ' && menu) {
      hideMenu();
    }
  });

  const showMenu = () => {
    menu = true;
  };

  const hideMenu = () => {
    cl.setup();
    menu = false;
  };

  const updateActorArray = (arr: Actor[]) => {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      a.update();
      if (a.remv) {
        arr.splice(i, 1);
        i--;
      }
    }
  };

  const drawActorArray = (arr: Actor[]) => {
    for (let i = 0; i < arr.length; i++) {
      const a = arr[i];
      if (cl.room.isTileVisible(a.x, a.y)) {
        a.draw();
      }
    }
  };

  const drawMenu = () => {
    if (menuTimer.isDone()) {
      menuBlink = !menuBlink;
      menuTimer.start();
    }

    const ctx = getCtx();
    const { width, height } = ctx.canvas;
    const scale = cl.scale;
    drawRect(0, 0, ctx.canvas.width, ctx.canvas.height, '#000');

    const drawLine = (offset: number, scale: number, vertical?: boolean) => {
      for (let i = 0; i < 9; i++) {
        if (vertical) {
          drawSprite('s_24', offset, i * 16 * scale, scale);
        } else {
          drawSprite('s_24', i * 16 * scale, offset, scale);
        }
      }
    };

    drawLine(0, scale);
    drawLine(height - 16 * scale, scale);
    drawLine(0, cl.scale, true);
    drawLine(width - 16 * scale, scale, true);

    pickUpNotif.style.opacity = '0';
    warnNotif.style.opacity = '0';

    drawSprite(
      's_17',
      width / 2 - (scale * 16) / 2,
      height / 2 - (scale * 16) / 2,
      scale
    );

    drawSprite(
      's_18',
      width / 2 - (scale * 16) / 2 - 16 * scale,
      height / 2 - (scale * 16) / 2,
      scale
    );
    drawSprite(
      menuBlink ? 's_29' : 's_30',
      width / 2 - (scale * 16) / 2 - 16 * scale,
      height / 2 - (scale * 16) / 2,
      scale
    );
    drawSprite(
      's_18',
      width / 2 - (scale * 16) / 2 + 16 * scale,
      height / 2 - (scale * 16) / 2,
      scale
    );
    drawSprite(
      menuBlink ? 's_30' : 's_29',
      width / 2 - (scale * 16) / 2 + 16 * scale,
      height / 2 - (scale * 16) / 2,
      scale
    );

    drawText('TAVERNITY', width / 2, height / 2 - 2 * 16 * scale, {
      size: 42,
      align: 'center',
    });
    drawText('Last Score: 0', width / 2, height / 2 + 16 * scale, {
      size: 24,
      align: 'center',
    });
    drawText(
      'Press (SPACE) to start',
      width / 2,
      height / 2 + 2 * 16 * scale + 16,
      {
        size: 24,
        align: 'center',
      }
    );
    // pickUpNotif.innerHTML = 'TAVERNITY';
  };

  const cl: Game = {
    cx: 0,
    cy: 0,
    scale: 4,
    room,
    tileOrch: createTileOrchestrator(room, 1),
    items: [],
    patrons: [],
    particles: [],
    fParticles: [],
    setup() {
      console.log('setup');
      player.reset();
      if (cl.room) {
        cl.room.reset();
      }

      cl.items = [];
      cl.patrons = [];
      cl.particles = [];
      cl.fParticles = [];
      cl.tileOrch = createTileOrchestrator(room, 1);

      cl.items.push(createItem('mugEmpty', 5, 7));
      cl.items.push(createItem('mugEmpty', 6, 7));
      cl.items.push(createItem('mugEmpty', 10, 10));

      // cl.patrons.push(createPatron('person', 5, 8));
      cl.patrons.push(createPatron('person', 12, 4));

      player.x = 13;
      player.y = 18;

      spawnOrch.start(1);
    },
    setAdjTableOnFire(pos: Point) {
      const tile = cl.getAdjTile(pos, [TABLE_HORIZONTAL, TABLE_VERTICAL]);
      if (tile && tile[0] !== ON_FIRE) {
        const [, x, y] = tile;
        cl.room.setTileAt(x, y, ON_FIRE);
        const item = cl.getItemAt(x, y);
        playSound('fire');
        if (item && item.name === 'mugFull') {
          item.name = 'mugEmpty';
        }
      }
    },
    getPlayer() {
      return player;
    },
    getItemAt(x: number, y: number) {
      return cl.items.find((i) => i.x === x && i.y === y);
    },
    getPatronAt(x: number, y: number) {
      return cl.patrons.find((p) => p.x === x && p.y === y);
    },
    getAdjTile([x, y]: Point, tileIds: number[]) {
      for (const tileId of tileIds) {
        for (const [_x, _y] of createAdjacentIterArray([x, y])) {
          const tile = cl.room.getTileAt(_x, _y);
          if (tile && tile[0] === tileId) {
            return tile;
          }
        }
      }
    },
    getAdjItem([x, y]: Point) {
      let ctr = 0;
      let lastItem: Item | undefined;
      let lastPoint: Point | undefined;
      const adjArray = createAdjacentIterArray([x, y]).concat([[x, y]]);
      for (const item of cl.items) {
        for (const [_x, _y] of adjArray) {
          if (item.x === _x && item.y === _y) {
            if (!lastItem || lastItem.name === item.name) {
              ctr++;
              lastItem = item;
              lastPoint = [_x, _y];
            }
          }
        }
      }
      if (lastItem && lastPoint) {
        return [lastItem, ctr, lastPoint];
      }
    },
    showWarning(text: string) {
      warnNotif.style.opacity = '1';
      warnNotif.innerHTML = text;
      warningTimer.start();
    },
    update(fm: number) {
      if (menu) {
        return;
      }

      spawnOrch.update();

      room.update();
      updateActorArray(cl.patrons);
      player.update();
      updateActorArray(cl.particles);
      updateActorArray(cl.fParticles);
      updateActorArray(cl.items);

      const canvas = getCanvas();
      cl.cx = player.x * 16 * cl.scale - canvas.width / 2 + 8 * cl.scale;
      cl.cy = player.y * 16 * cl.scale - canvas.height / 2 + 8 * cl.scale;
    },
    draw() {
      const ctx = getCtx();

      if (menu) {
        drawMenu();
        return;
      }

      ctx.save();
      ctx.translate(-cl.cx, -cl.cy);
      ctx.scale(cl.scale, cl.scale);

      cl.room.draw();
      drawActorArray(cl.fParticles);
      drawActorArray(cl.items);
      drawActorArray(cl.patrons);
      player.draw();
      drawActorArray(cl.particles);

      const action = getAvailableAction(cl);
      if (!action) {
        pickUpNotif.style.opacity = '0';
        lastLabel = '';
      } else {
        const { type, item } = action;

        let nextLabel = '';

        switch (type) {
          case ACTION_PICKUP_LEFT:
          case ACTION_PICKUP_RIGHT:
            nextLabel = `Pick up ${itemNameToLabel(
              (item as Item).name
            )} (Space)`;
            break;
          case ACTION_PICKUP_WEAPON:
            nextLabel = `Pick up Sword (Space)`;
            break;
          case ACTION_PICKUP_BUCKET:
            nextLabel = `Pick up Water Bucket (Space)`;
            break;
          case ACTION_PUTDOWN_LEFT:
          case ACTION_PUTDOWN_RIGHT:
            nextLabel = `Place ${itemNameToLabel((item as Item).name)} (Space)`;
            break;
          case ACTION_FILL_LEFT:
          case ACTION_FILL_RIGHT:
            nextLabel = `Fill Mug (Space)`;
            break;
          case ACTION_PUTDOWN_WEAPON:
            nextLabel = `Put away Sword (Space)`;
            break;
          case ACTION_REPAIR:
            nextLabel = `Repair (Space)`;
            break;
        }

        if (lastLabel !== nextLabel || lastLabel === '') {
          pickUpNotif.style.opacity = '1';
          pickUpNotif.innerHTML = nextLabel;
          lastLabel = nextLabel;
        }
      }

      if (warningTimer.isDone()) {
        warnNotif.style.opacity = '0';
      }

      ctx.restore();
    },
  };

  (window as any).game = cl;

  cl.setup();

  return cl;
}
