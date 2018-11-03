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

async function game(context){
  const newDataBuffer = new ArrayBuffer(SCREEN_W * SCREEN_H * 4);
  const newData8 = new Uint8ClampedArray(newDataBuffer);
  const newData32 = new Uint32Array(newDataBuffer);
  const newImageData = new ImageData(newData8, SCREEN_W);

  // game tick
  setInterval(()=>{
    gameLoop(newData32);
  }, 10);

  // render tick
  for await (const frame of getFrame()) {
    context.putImageData(newImageData, 0, 0);
  }
}

let current_pixel, current_x, current_y;
function pick(next, old) {
  if (next === null) return old;
  return next;
}
function gameLoop(src32){
  // move line
  const line = state.line;
  state.line = line > SCREEN_W ? 0 : line + 1;

  // loop through every pixel in canvas
  current_x = 0;
  current_y = 0;
  for (current_pixel = 0; current_pixel < src32.length; current_pixel++){
    let newPixel = drawBackground();
    newPixel = pick(drawMovingVerticalLine(line), newPixel);
    newPixel = pick(drawMenu(), newPixel);
    newPixel = pick(drawLine(100, 100, 300, 300), newPixel);
    src32[current_pixel] = newPixel;

    if (current_x === SCREEN_W){
      current_x = 0;
      current_y++;
    } else {
      current_x++;
    }
  }
}

function drawBackground(){
  return RED;
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
  const m = (dy - y) / (dx - x);
  const b = y - (m * x);

  const isOnLine = (
    current_x >= x && current_x <= dx &&
    current_y >= y && current_y <= dy &&
    (m*current_x + b) === current_y
  );
  if (isOnLine) return GREEN;

  return null;
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
