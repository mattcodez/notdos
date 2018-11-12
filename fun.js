"use strict";

function init(){
  const canvas = document.getElementById('screen');
  const context = canvas.getContext('2d');
  game(context);
}

const SCREEN_W = 640,
      SCREEN_H = 480,
      RED = 0xFF0000FF,
      GREEN = 0xFF00FF00,
      BLUE = 0xFFFF0000,
      BLACK = 0xFF000000;

let g_assets;

function loadAssets() {
  return Promise.all([
    getAsset('assets/DwarfPrew.png')
  ]);
}

function getAsset(path) {
  const img = new Image();
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const prom = new Promise(resolve =>
    img.onload = () => {
      context.drawImage(img, 0, 0);
      resolve(
        [
          Uint32Array.from(context.getImageData(0, 0, img.naturalWidth, img.naturalHeight).data),
          img.naturalWidth,
          img.naturalHeight
        ]
      );
    }
  );
  img.crossOrigin = "Anonymous";
  img.src = path;
  return prom;
}

async function game(context){
  const newDataBuffer = new ArrayBuffer(SCREEN_W * SCREEN_H * 4);
  const newData8 = new Uint8ClampedArray(newDataBuffer);
  const newData32 = new Uint32Array(newDataBuffer);
  const newImageData = new ImageData(newData8, SCREEN_W);

  g_assets = await loadAssets();

  // game tick
  setInterval(()=>{
    stateLoop();
  }, 10);

  // render tick
  for await (const frame of getFrame()) {
    gameLoop(newData32);
    context.putImageData(newImageData, 0, 0);
  }
}

function lastValid(){
  let last;
  for (let i = 0; i < arguments.length; i++){
    let arg = arguments[i];
    if (arg === null || arg === undefined) continue;
    else last = arg;
  }
  return last;
}

function stateLoop(){
  // move line
  const line = state.line;
  state.line = line > SCREEN_W ? 0 : line + 1;
}

let current_pixel, g_current_x, g_current_y;
function gameLoop(src32){
  // loop through every pixel in canvas
  g_current_x = 0;
  g_current_y = 0;
  for (current_pixel = 0; current_pixel < src32.length; current_pixel++){
    let newPixel = lastValid(
      drawBackground(),
      drawMovingVerticalLine(state.line),
      drawMenu(),
      drawLine(100, 100, 300, 300),
      drawSprite(g_assets[0], 200, 300),
      //drawLine(600, 10, 550, 320),
      //drawBox(20, 20, 120, 20)
    );
    src32[current_pixel] = newPixel;

    if (g_current_x === SCREEN_W){
      g_current_x = 0;
      g_current_y++;
    } else {
      g_current_x++;
    }
  }
}

function drawBackground(){
  return RED;
}

function drawSprite(sprite, x, y){
  if (
    (g_current_x >= x && g_current_x <= (x+sprite[1])) &&
    (g_current_y >= y && g_current_y <= (y+sprite[2]))
  ) {
    return 0xFF000000 | sprite[0][g_current_x - x + g_current_y - y];
  }
}

function drawMovingVerticalLine(lineLocation){
  if ((current_pixel % SCREEN_W) === lineLocation){
    return BLACK;
  }
  return null;
}

const MENU_CONSTANTS = { /* when ready */ };
function drawMenu(){
  if (!state.showMenu) return;

  const top = SCREEN_H / 4;
  const left = SCREEN_W / 4;

  const lineByteStart = top * SCREEN_W;
  const start = lineByteStart + left;
  const stop = lineByteStart + left + SCREEN_W / 2;
  // top line
  if (current_pixel >= start && current_pixel <= stop) {
    return BLACK;
  }

  return null;
}

function drawLine(x, y, dx, dy) {
  const m = (dy - y) / (dx - x),
  b = y - (m * x),
  minX = Math.min(x,dx),
  maxX = Math.max(x,dx),
  minY = Math.min(y,dy),
  maxY = Math.max(y,dy);
  return drawCalculatedLine(minX, maxX, minY, maxY, m, b);
}

function drawCalculatedLine(minX, maxX, minY, maxY, m, b){
  const isOnLine = (
    g_current_x >= minX && g_current_x <= maxX &&
    g_current_y >= minY && g_current_y <= maxY &&
    (m*g_current_x + b) === g_current_y
  );
  if (isOnLine) return GREEN;
  return null;
}

function drawBox(x, y, width, height) {
  return lastValid(
    drawLine(x, y, x + width, y),
    drawLine(x, y + height, x + width, y + height),
    drawLine(x, y, x + height, y),
    drawLine(x + width, y, x + width, y + height)
  );
}

const state = {line: 0, showMenu: true};

const menu = {
  options: [
    {id: 1, name: "New Game"},
    {id: 1, name: "Quit"}
  ]
};

function* getFrame(path) {
  while (true){
    yield (new Promise(r => window.requestAnimationFrame(r)));
  }
}

init();
