import { initDb } from './db';
import {
  clearScreen,
  finishDrawing,
  getCanvas,
  loadImagesAndSprites,
  setFm,
  setupDrawing,
} from './draw';
import { Game, createGame } from './game';
import { normalize } from './utils';
import { setVolume } from './zzfx';

window.addEventListener('load', () => {
  start();
  // setVolume(0);
});

const EXPECTED_FS = 10;
export const start = async () => {
  console.log('game started2');
  load();
};

const load = async () => {
  console.log('loading...');
  await loadImagesAndSprites([
    ['packed', 'res/sprites.png', 16, 16, 1, 1, ['s']],
  ]);
  console.log('loaded');
  initDb();

  const cWidth = Number(localStorage.getItem('js13k2023_tavernity_width'));
  if (!isNaN(cWidth) && cWidth > 0) {
    console.log('SET CWIDTH', cWidth);
    const canvas = getCanvas();
    canvas.style.width = cWidth + 'px';
  }

  loop(createGame());
};

const loop = (game: Game) => {
  const startTime = performance.now();
  let prevNow = startTime;

  const msPerUpdate = 22;
  const targetMult = normalize(msPerUpdate, 16, 30, 1, 2);

  const _loop = () => {
    const now = performance.now();
    let frameTime = now - prevNow;
    let prevFrameTime = Math.floor(frameTime);
    prevNow = now;

    if (frameTime > 4) {
      frameTime = 4;
    }
    const deltaTime = frameTime;
    frameTime -= deltaTime;
    const fm = (deltaTime * targetMult) / EXPECTED_FS;
    setFm(fm);
    game.update(fm);

    // draw.drawText('FS: ' + prevFrameTime, draw.width - 100, 50, {
    //   align: 'left',
    // });
  };

  const _loopRender = () => {
    clearScreen();
    game.draw();
    requestAnimationFrame(_loopRender);
  };

  setInterval(_loop, msPerUpdate);
  _loopRender();
};

(window as any).vol = (input: HTMLInputElement) => {
  const v = (Number(input.value) * 0.3) / 100;
  setVolume(v);
};
