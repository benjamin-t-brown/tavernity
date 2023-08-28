import { getGame } from './game';
import { createPatron } from './patron';
import { Point, Timer, playSound, pointsEq, randInArr } from './utils';

interface SpawnOrchestrator {
  start: (level: number) => void;
  stop: () => void;
  isDone: () => boolean;
  update: () => void;
}

export const createSpawnOrchestrator = (): SpawnOrchestrator => {
  const personSpawnTimer1 = new Timer(1);
  const moleSpawnTimer1 = new Timer(1);
  let enabled = false;
  let level = 1;
  let spawned = 0;
  let totalToSpawn = 0;

  let moleSpawned = 0;
  let totalMoleToSpawn = 0;

  const getSpawnTiles = () => {
    const game = getGame();

    return game.room.tiles.filter((tile) => {
      for (const p of game.room.spawns) {
        if (
          pointsEq(p, tile.slice(1) as Point) &&
          game.room.getTileLevel(tile) <= level
        ) {
          return true;
        }
      }
    });
  };

  const spawn = (type: 'person' | 'mole') => {
    const game = getGame();
    const spawnTiles = getSpawnTiles();

    let tile = randInArr(spawnTiles);
    let tx: number, ty: number;
    do {
      tx = tile[1];
      ty = tile[2];
      if (!game.getPatronAt(tx, ty)) {
        break;
      }
      const ind = spawnTiles.indexOf(tile);
      if (ind > -1) {
        spawnTiles.splice(spawnTiles.indexOf(tile), 1);
      }
      tile = randInArr(spawnTiles);
    } while (tile && spawnTiles.length > 0);

    if (!tile) {
      return false;
    }

    // don't spawn a person unless there is a table available for them
    if (type === 'person' && !game.tileOrch.isTileAvailable('Table')) {
      return false;
    }

    const patron = createPatron(type, tx, ty);
    game.patrons.push(patron);
    console.log('spawn patron', patron, tx, ty);
    return true;
  };

  const cl: SpawnOrchestrator = {
    start: (l: number) => {
      enabled = true;
      personSpawnTimer1.ms = 100;
      personSpawnTimer1.start();
      spawned = 0;
      totalToSpawn = 10 + l * 2;
      totalMoleToSpawn = 1;
      moleSpawned = 0;
      level = l;
    },
    stop: () => {
      enabled = false;
    },
    isDone: () => {
      return spawned >= totalToSpawn;
    },
    update() {
      if (!enabled) {
        return;
      }
      if (this.isDone()) {
        return;
      }

      // if (personSpawnTimer1.isDone()) {
      //   personSpawnTimer1.ms = 1000 + Math.random() * 10000;
      //   // personSpawnTimer1.ms = 500;
      //   personSpawnTimer1.start();
      //   if (spawn('person')) {
      //     spawned++;
      //   }
      // }
      if (moleSpawnTimer1.isDone() && moleSpawned < totalMoleToSpawn) {
        moleSpawnTimer1.ms = 500;
        moleSpawnTimer1.start();
        if (spawn('mole')) {
          playSound('moleAlert');
          moleSpawned++;
        }
      }
    },
  };

  return cl;
};
