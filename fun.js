"use strict";

function init(){
  const canvas = document.getElementById('screen');
  const context = canvas.getContext('2d');
  game(context);
}

const SCREEN_W = 640,
      SCREEN_H = 480;

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

function gameLoop(src32){
  // move line
  const line = state.line;
  state.line = line > SCREEN_W ? 0 : line + 1;

  // loop through every pixel in canvas
  for (let i = 0; i < src32.length; i++){
    drawBackground(i, src32);
    drawMovingVerticalLine(i, line, src32);
    //drawMenu(i, src32);
  }
}

function drawBackground(i, src32){
  src32[i] = 0xFF0000FF;
}

function drawMovingVerticalLine(i, line, src32){
  if ((i % SCREEN_W) === line){
    src32[i] = 0x000000FF;
  }
}

const MENU_CONSTANTS = { /* when ready */ };
function drawMenu(i, src8){
  if (!state.showMenu) return;

  const top = SCREEN_H / 4;
  const left = SCREEN_W / 4;

  const start = (top * SCREEN_W) + left;
  // top line
  if (i >= start && i <= stop) {

  }

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
