"use strict";

function init(){
  const canvas = document.getElementById('screen');
  const context = canvas.getContext('2d');
  game(context);
}

async function game(context){
  let imageData = context.getImageData(0, 0, 640, 480);
  let data = imageData.data;
  let buffer = data.buffer;
  let data8 = new Uint8Array(buffer); //Per-color access

  let newDataBuffer = new ArrayBuffer(data.length);
  let newData8 = new Uint8ClampedArray(newDataBuffer);

  // game tick
  setInterval(()=>{
    gameLoop(newData8);
    data.set(newData8);
  }, 10);

  // render tick
  for await (const frame of getFrame()) {
    context.putImageData(imageData, 0, 0);
  }
}

function gameLoop(src8){
  // move line
  const line = state.line;
  state.line = line > 640 ? 0 : line + 1;

  for (let i = 0; i < src8.length; i+=4){
    drawBackground(i, src8);
    drawVerticalLine(i, line, src8);
  }
}

function drawBackground(i, src8){
  src8[i] = 0xFF;
  src8[i+1] = 0;
  src8[i+2] = 0;
  src8[i+3] = 0xFF;
}

function drawVerticalLine(i, line, src8){
  if ((i/4 % 640) === line){
    src8[i] = 0;
    src8[i+1] = 0;
    src8[i+2] = 0;
    src8[i+3] = 0xFF;
  }
}

const state = {line: 0, menu: true};

const menu = {
  options: [
    {id: 1, name:"New Game"},
    {id: 1, name:"Quit"}
  ]
};

async function* getFrame(path) {
  while (true){
    yield await (new Promise(r => window.requestAnimationFrame(r)));
  }
}

init();
