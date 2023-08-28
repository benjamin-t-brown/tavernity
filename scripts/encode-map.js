const fs = require('fs');
const { exec } = require('child_process');

const execAsync = async (command) => {
  return new Promise((resolve, reject) => {
    console.log(command);
    exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err + ' ' + stderr);
        return;
      }
      resolve(stdout);
    });
  });
};

const main = () => {
  const tiledMap = JSON.parse(
    fs.readFileSync(__dirname + '/../scratch/untitled.json').toString()
  );
  const tiles = tiledMap.layers[0].data;
  const spawns = tiledMap.layers[1].objects.map((obj) => {
    return [
      Math.floor(obj.x / 16),
      Math.floor(obj.y / 16) - 1,
    ];
  });

  fs.writeFileSync(
    __dirname + '/../res/map.json',
    JSON.stringify({
      tiles,
      spawns,
      width: tiledMap.width,
      height: tiledMap.height,
    })
  );
};
main();
