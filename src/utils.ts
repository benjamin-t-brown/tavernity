import { getSound } from './db';
import { getCanvas } from './draw';
import { getGame } from './game';
import { Tile} from './room';
import { rand, zzfxPlaySound } from './zzfx';

export type Direction = 'l' | 'r';

export const getNow = () => {
  return window.performance.now();
};

export type Point = [number, number];
export type Point3d = [number, number, number];
export type Vec4 = [number, number, number, number];
export type Circle = Point3d;
export type Rect = [number, number, number, number];

export const normalize = (
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
) => {
  return c + ((x - a) * (d - c)) / (b - a);
};

export interface Actor {
  scale: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  meta?: any;
  remv?: boolean;
  getRect: () => Rect;
  update: () => void;
  draw: () => void;
}

export const createActor = (): Actor => {
  const cl = {
    x: 0,
    y: 0,
    scale: 1,
    vx: 0,
    vy: 0,
    remv: false,
    getRect: (): Rect => {
      return [cl.x, cl.y, 16, 16];
    },
    update: () => {
      cl.x += cl.vx;
      cl.y += cl.vy;
    },
    draw: () => void 0,
  };
  return cl;
};

export const timeoutPromise = async (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

export class Timer {
  ms: number;
  s: number = -999;
  constructor(ms: number) {
    this.ms = ms;
  }
  start() {
    this.s = getNow();
  }
  stop() {
    this.s = 0;
  }
  pct() {
    let now = getNow();
    let diff = now - this.s;
    if (diff > this.ms) {
      diff = this.ms;
    } else if (diff < 0) {
      diff = -1;
    }
    return Math.min(1, diff / this.ms);
  }
  isDone() {
    return getNow() - this.s >= this.ms;
  }
}

const keys: Record<string, boolean> = {};

window.addEventListener('keydown', e => {
  // console.log('keydown', e.key);
  keys[e.key] = true;

  const canvas = getCanvas();
  let cWidth = parseInt(canvas.style.width);
  if (isNaN(cWidth)) {
    cWidth = canvas.width;
  }
  if (e.key === '+') {
    cWidth += 100;
    canvas.style.width = cWidth + 'px';
    console.log('plus canv')
  }
  if (e.key === '-') {
    cWidth -= 100;
    canvas.style.width = cWidth + 'px';
    console.log('minus canv')
  }

  localStorage.setItem('js13k2023_tavernity_width', String(cWidth));

});
window.addEventListener('keyup', e => {
  keys[e.key] = false;
});

export const isKeyDown = (k: string) => {
  return keys[k];
};

export const dirToOffsets = (dir: Direction): Point => {
  switch (dir) {
    case 'l':
      return [-1, 0];
    case 'r':
      return [1, 0];
  }
};

export const hexToRgbA = (hex: string) => {
  let c: any = hex.substring(1).split('');
  if (c.length == 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
};

// export const collides
export const circleCircleCollision = (a: Circle, b: Circle): boolean => {
  const [x1, y1, r1] = a;
  const [x2, y2, r2] = b;

  const dist = calculateDistance([x1, y1, 0], [x2, y2, 0]);
  return dist <= r1 + r2;
};

export const calculateDistance = (a: Point3d, b: Point3d) => {
  const [x1, y1, z1] = a;
  const [x2, y2, z2] = b;
  return Math.sqrt(
    Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2)
  );
};

export const isPointInRect = (p: Point, r: Rect) => {
  const [px, py] = p;
  const [rx1, ry1, rx2, ry2] = r;
  return px >= rx1 && px <= rx2 && py >= ry1 && py <= ry2;
};

export const rectRectCollision = (r1: Rect, r2: Rect) => {
  const [x1, y1, x2, y2] = r1;
  return (
    isPointInRect([x1, y1], r2) ||
    isPointInRect([x1, y2], r2) ||
    isPointInRect([x2, y1], r2) ||
    isPointInRect([x2, y2], r2)
  );
};

export const playSound = (soundName: string) => {
  const s = getSound(soundName);
  zzfxPlaySound(s);
};

export const getAngleTowards = (
  point1: Point3d | Point,
  point2: Point3d | Point
): number => {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  const lenY = y2 - y1;
  const lenX = x2 - x1;
  const hyp = Math.sqrt(lenX * lenX + lenY * lenY);
  let ret = 0;
  if (y2 >= y1 && x2 >= x1) {
    ret = (Math.asin(lenY / hyp) * 180) / Math.PI + 90;
  } else if (y2 >= y1 && x2 < x1) {
    ret = (Math.asin(lenY / -hyp) * 180) / Math.PI - 90;
  } else if (y2 < y1 && x2 > x1) {
    ret = (Math.asin(lenY / hyp) * 180) / Math.PI + 90;
  } else {
    ret = (Math.asin(-lenY / hyp) * 180) / Math.PI - 90;
  }
  if (ret >= 360) {
    ret = 360 - ret;
  }
  if (ret < 0) {
    ret = 360 + ret;
  }
  return ret;
};

export const getModalText = (str: string) => {
  return `<div style="max-width:${getCanvas().width - 64}">${str}</div>`;
};

export const randInArr = (arr: any[]) => {
  return arr[Math.floor(rand()* arr.length)];
}

// export const pxPosToTilePos = (px: number, py: number): Point => {
//   const tileWidth = 16;
//   const tileHeight = 16;
//   const x = px / tileWidth;
//   const y = py / tileHeight;
//   return [x, y];
// };
