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

function lastValid(){
  let last;
  for (let i = 0; i < arguments.length; i++){
    let arg = arguments[i];
    if (arg === null || arg === undefined) continue;
    else last = arg;
  }
  return last;
}

let current_pixel, current_x, current_y;
function gameLoop(src32){
  // move line
  const line = state.line;
  state.line = line > SCREEN_W ? 0 : line + 1;

  // loop through every pixel in canvas
  current_x = 0;
  current_y = 0;
  for (current_pixel = 0; current_pixel < src32.length; current_pixel++){
    let newPixel = lastValid(
      drawBackground(),
      drawMovingVerticalLine(line),
      drawMenu(),
      drawLine(100, 100, 300, 300),
      drawLine(600, 10, 550, 40),
      drawBox(20, 20, 120, 20)
    );
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

const memoizeLine = {};
function drawLine(x, y, dx, dy) {
  const prop = `${x}_${y}_${dx}_${dy}`;
  const vals = memoizeLine[prop];
  let m,b,minX,maxX,minY,maxY;
  if (vals) {
    ({m,b,minX,maxX,minY,maxY} = vals);
  }
  else {
    m = (dy - y) / (dx - x);
    b = y - (m * x);
    minX = Math.min(x,dx);
    maxX = Math.max(x,dx);
    minY = Math.min(y,dy);
    maxY = Math.max(y,dy);
    memoizeLine[prop] = {m,b,minX,maxX,minY,maxY};
  }

  const isOnLine = (
    current_x >= minX && current_x <= maxX &&
    current_y >= minY && current_y <= maxY &&
    (m*current_x + b) === current_y
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
