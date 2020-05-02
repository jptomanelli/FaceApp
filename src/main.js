import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import { setWasmPath } from "@tensorflow/tfjs-backend-wasm";
import { Controls } from './controls.js';
import { drawImage, drawEmoji, drawFacePull } from './effects';

const WASM_PATH = './build/tfjs-backend-wasm.wasm';
const EFFECTS = {
  EMOJI: 'emoji', 
  FACEPULL: 'facepull'
};

async function main() {
  const video = document.querySelector('#video');
  const canvas = document.querySelector('#canvas');
  const effectButtons = document.querySelectorAll('[data-effect]');

  let currentEffect = '';

  [...effectButtons].forEach((btn, _, allBtns) => {
    btn.addEventListener('click', e => {
      if (btn.dataset.effect === currentEffect) {
        currentEffect = '';
      } else {
        currentEffect = btn.dataset.effect;
      }
    });
  })

  const ctx = canvas.getContext('2d');

  setWasmPath(WASM_PATH);
  await tf.setBackend("wasm");

  //  mouse and touch controls
  const controls = new Controls({ parentElement: canvas });
  controls.attachEvents();

  //  wait for camera approval
  const webcam = await tf.data.webcam(video);

  let height = video.videoHeight;
  let width = video.videoWidth;

  canvas.width = width;
  canvas.height = height;
  video.width = width;
  video.height = height;


  const model = await facemesh.load();

  try {
    while (true) {
      
      //  Get image from cam and send to model
      const image = await webcam.capture();
      const faces = await model.estimateFaces(image);

      if (currentEffect === EFFECTS.EMOJI) {
        drawEmoji({ image, ctx, height, width, faces });
      } else if (currentEffect === EFFECTS.FACEPULL) {
        drawFacePull({ image, ctx, height, width, faces, controls });
      } else {
        drawImage({ image, ctx, height, width });
      }

      //  Clean up after yourself
      image.dispose();

      await tf.nextFrame();
    
    }
  } catch (err) {
    console.error(err);
  }

}

main();