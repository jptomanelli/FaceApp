import * as tf from "@tensorflow/tfjs";
import * as facemesh from "@tensorflow-models/facemesh";
import { setWasmPath } from "@tensorflow/tfjs-backend-wasm";
import { Controls } from './controls.js';
import { drawImage, drawEmoji, drawFacePull } from './effects';

const WASM_PATH = './build/tfjs-backend-wasm.wasm';

async function main() {
  const video = document.querySelector('#video');
  const canvas = document.querySelector('#canvas');

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
  canvas.style.maxWidth = `${width}px`;
  canvas.style.maxHeight = `${height}px`;
  video.width = width;
  video.height = height;


  const model = await facemesh.load();

  try {
    while (true) {
      
      //  Get image from cam and send to model
      const image = await webcam.capture();
      const faces = await model.estimateFaces(image);

      //  Effects!
      drawFacePull({ image, ctx, height, width, faces, controls });

      //  Clean up after yourself
      image.dispose();

      await tf.nextFrame();
    
    }
  } catch (err) {
    console.error(err);
  }

}

main();