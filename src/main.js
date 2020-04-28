import * as mobilenet from "@tensorflow-models/mobilenet";
import * as facemesh from "@tensorflow-models/facemesh";
import * as tf from "@tensorflow/tfjs";
import Controls from './controls.js';
import { drawImage, drawEmoji, drawFacePull } from './effects';

/**
 * Main app loop
 */
class App {

  constructor() {

    //  Is TF completely loaded
    this.loaded = false;
    this.running = false;

    //  Element Reference
    this.video = document.querySelector('#video');
    this.canvas = document.querySelector('#canvas');

    //  Mouse / touch event data
    this.controls = new Controls({ parentElement: this.canvas });
    this.controls.attachEvents();

    //  set video to visible and canvas hidden
    this.toggleCanvas(false);

    //  Canvas context
    this.ctx = canvas.getContext('2d');

    //  height and video of the camvas determined by the webcam
    this.width;
    this.height;

    this.currentEffect;
    this.effectState = {};

    this._load().then(this.startLoop.bind(this));
  }

  async _load() {
    this.webcam = await tf.data.webcam(this.video);
    this._setheightAndWidth();
    return Promise.all([mobilenet.load(), facemesh.load()]).then(([_, model]) => {
      this.model = model;
      this.loaded = true;
    });
  }

  _setheightAndWidth() {
    this.height = this.video.videoHeight;
    this.width = this.video.videoWidth;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.video.width = this.width;
    this.video.height = this.height;
  }

  toggleCanvas(show = true) {
    if (show) {
      this.canvas.style.display = '';
      setTimeout(() => this.video.style.display = 'none', 100);
    } else {
      this.video.style.display = '';
      setTimeout(() => this.canvas.style.display = 'none', 100);
    }
  }

  async startLoop() {

    if (this.isRunning === true) {
      return;
    }

    this.isRunning = true;
    this.toggleCanvas();

    try {

      while (true) {

        const { ctx, height, width, controls, effectState } = this;
        const image = await this.webcam.capture();
        let faces = [];
        if (this.loaded) {
          faces = await this.model.estimateFaces(image);
        }
        drawFacePull({ image, ctx, height, width, faces, controls, effectState });
        image.dispose();
        await tf.nextFrame();
      }

    } catch (err) {
      console.error(err);
      this.isRunning = false;

    }
  }

}

const app = new App();
window.app = app;
