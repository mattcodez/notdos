"use strict";

function init(){
  const canvas = document.getElementById('screen');
  const context = canvas.getContext('2d');
  game(context);
}

function game(context){
  let imageData = context.getImageData(0, 0, 640, 480);
  let data = imageData.data;
  let buffer = data.buffer;
  let data8 = new Uint8Array(buffer); //Per-color access

  let newDataBuffer = new ArrayBuffer(data.length);
  let newData8 = new Uint8ClampedArray(newDataBuffer);

  setInterval(()=>{
    gameLoop(newData8);
    data.set(newData8);
  }, 10);

  function animationFrame() {
    let resolve = null;
    const promise = new Promise(r => resolve = r);
    window.requestAnimationFrame(resolve);
    return promise;
  }

  (async function game() {
    // the game loop
    while (true) {
      await animationFrame();
      context.putImageData(imageData, 0, 0);
    }
  })();
}

const state = {line: 0};
function gameLoop(src8){
  // alter line data
  const line = state.line;
  state.line = line > 640 ? 0 : line + 1;

  for (let i = 0; i < src8.length; i+=4){
    // draw background
    src8[i] = 0xFF;
    src8[i+1] = 0;
    src8[i+2] = 0;
    src8[i+3] = 0xFF;

    // draw vertical line
    if ((i/4 % 640) === line){
      src8[i] = 0;
      src8[i+1] = 0;
      src8[i+2] = 0;
      src8[i+3] = 0xFF;
    }
  }

}

init();
