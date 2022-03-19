const DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1;
const SCALE = 25;
const SIZE = 21;
const FPS = 1000 / 20;
const WIDTH = SIZE * SCALE + 4;
const HEIGHT = SIZE * SCALE + 4;
const COLOR_BLACK = '#171A21';
const COUNT = 50;

const canvas = document.querySelector('canvas');
const g = canvas.getContext('2d');
const refresh = document.querySelector('button#refresh');

scaleCanvas(canvas, WIDTH, HEIGHT);

/* #################################################################################### */

let map = createMap(SIZE);
let list = [];
let button = 0;
let then = Date.now();
let lose = null;
let win = false;
let r = 1;

function render(hx, hy) {
  g.clearRect(0, 0, WIDTH, HEIGHT);
  g.strokeStyle = COLOR_BLACK;
  g.fillStyle = COLOR_BLACK;
  g.lineWidth = 4;
  g.fillRect(0, 0, WIDTH, HEIGHT);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '15px Roboto Mono';

  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      g.fillStyle = map[y][x] === 9 ? '#E53935' : '#1E2027';
      if(map[y][x] < 0) {
        g.fillStyle = 'white';
      }
      if (map[y][x] === null) {
        g.fillStyle = COLOR_BLACK;
      }
      g.fillRect(x * SCALE + 2, y * SCALE + 2, SCALE, SCALE);
      g.fillStyle = 'white';
      if(map[y][x] > 0 && map[y][x] < 9) {
        g.fillText(map[y][x], x * SCALE + 2 + SCALE / 2, y * SCALE + 2 + SCALE / 2 + 1);
      }
      g.strokeRect(x * SCALE + 2, y * SCALE + 2, SCALE, SCALE);
    }
  }

  if(lose === null && !win && hx !== undefined && hy !== undefined) {
    if(map[hy][hx] !== null) {
      g.strokeStyle = '#2096f3';
      g.strokeRect(hx * SCALE + 2, hy * SCALE + 2, SCALE, SCALE);
    }
  }
}

function createMap(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => -1));
}

function generate() {
  for(let i = 0; i < COUNT; i++) {
    let n = unique(0);
    let y = n.i;
    let x = n.j;
    map[y][x] = -10;
    list.push({ y, x });
  }
  for(let { y, x } of list) {
    for(let i = -1; i < 2; i++) {
      for(let j = -1; j < 2; j++) {
        if(y + i >= 0 && y + i < map.length && x + j >= 0 && x + j < map[y].length) {
          if(map[y + i][x + j] !== -10) {
            map[y + i][x + j]--;
          }
        }
      }
    }
  }
}

function unique(f) {
  if(f >= SIZE * SIZE) {
    throw new Error('Too many iterations!');
  }
  let i = Math.floor(Math.random() * SIZE);
  let j = Math.floor(Math.random() * SIZE);
  for(let { y, x } of list) {
    if(i === y && j === x) {
      return unique(f + 1);
    }
  }
  return { i, j };
}

function reveal(x, y, f) {
  if(f >= SIZE * SIZE) {
    throw new Error('Too many iterations!');
  }
  let n = map[y][x];
  if(n >= -1) {
    for(let i = -1; i < 2; i++) {
      for(let j = -1; j < 2; j++) {
        if(y + i >= 0 && y + i < map.length && x + j >= 0 && x + j < map[y].length) {
          let n = map[y + i][x + j];
          if(!(i === 0 && j === 0)) {
            if(n <= -1) {
              map[y + i][x + j] = map[y + i][x + j] * -1 - 1;
              if(n === -1) {
                reveal(x + j, y + i, f + 1);
              }
            }
          }
        }
      }
    }
  }
  else {
    map[y][x] = map[y][x] * -1 - 1;
  }
}

function update() {
  requestAnimationFrame(update);
  let now = Date.now();
  let elapsed = now - then;
  if(lose !== null && r < SIZE) {
    if(elapsed > FPS) {
      then = now - (elapsed % FPS);
      defeat(lose.x, lose.y, r++);
    }
  }
}

function defeat(x, y, n) {
  for(let i = -1 - n; i < 2 + n; i++) {
    for(let j = -1 - n; j < 2 + n; j++) {
      if(y + i >= 0 && y + i < map.length && x + j >= 0 && x + j < map[y].length) {
        map[y + i][x + j] = 9;
      }
    }
  }
  render();
}

function victory() {
  for(let i = 0; i < map.length; i++) {
    for(let j = 0; j < map[i].length; j++) {
      let n = map[i][j];
      if(n < 0 && n !== -10) {
        return;
      }
    }
  }
  win = true;
  for(let { y, x } of list) {
    map[y][x] = 9;
  }
}

canvas.onclick = function (event) {
  if(lose === null && !win) {
    let x = Math.floor((event.offsetX - 2) / SCALE);
    let y = Math.floor((event.offsetY - 2) / SCALE);
    if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
      if(map[y][x] !== null) {
        if(map[y][x] < 0 && map[y][x] > -9) {
          reveal(x, y, 0);
        }
        victory();
        if(map[y][x] === -10) {
          lose = { y, x };
        }
        render(x, y);
      }
    }
  }
}

canvas.onmousemove = function (event) {
  let x = Math.floor((event.offsetX - 2) / SCALE);
  let y = Math.floor((event.offsetY - 2) / SCALE);

  if (y >= 0 && y < map.length && x >= 0 && x < map[0].length) {
    render(x, y);
  }
};

canvas.onmouseleave = function () {
  render();
}

canvas.oncontextmenu = function (event) {
  event.preventDefault();
}

refresh.onclick = function() {
  map = createMap(SIZE);
  list = [];
  lose = null;
  win = false;
  r = 1;
  generate();
  render();
}

generate();
render();

requestAnimationFrame(update);

/* #################################################################################### */

function scaleCanvas(canvas, width, height) {
  const g = canvas.getContext('2d');
  const backingStoreRatio = g.webkitBackingStorePixelRatio || 1;
  const ratio = DEVICE_PIXEL_RATIO / backingStoreRatio;
  if (DEVICE_PIXEL_RATIO != backingStoreRatio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
  }
  else {
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = '';
    canvas.style.height = '';
  }
  g.scale(ratio, ratio);
}
