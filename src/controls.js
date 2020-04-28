import Coords from './coords';

class Controls {

  constructor(options = {}) {
    this.isPressedDown = false;
    this.startPos = new Coords();
    this.currentPos = new Coords();
    this.parentElement = options.parentElement || window;
  }

  attachEvents() {
    //  Desktop
    this.parentElement.addEventListener('mousedown', this._handleEventPressedDown.bind(this));
    this.parentElement.addEventListener('mousemove', this._handleEventMoved.bind(this));
    this.parentElement.addEventListener('mouseup', this._handleEventReleased.bind(this));
    //  mobile
    this.parentElement.addEventListener('touchstart', this._handleEventPressedDown.bind(this));
    this.parentElement.addEventListener('touchmove', this._handleEventMoved.bind(this));
    this.parentElement.addEventListener('touchend', this._handleEventReleased.bind(this));
  }

  getOffset() {
    if (this.isPressedDown) {
      const [x, y] = this.startPos.getOffset(this.currentPos);
      return { x, y };
    }
    return { x: 0, y: 0 };
  }

  _handleEventPressedDown({ x, y }) {
    this.startPos.x = x;
    this.startPos.y = y;
    this.currentPos.x = x;
    this.currentPos.y = y;

    this.isPressedDown = true; 
  }

  _handleEventMoved({ x, y }) {
    this.currentPos.x = x;
    this.currentPos.y = y;
  }

  _handleEventReleased() {

    this.isPressedDown = false;  

    this.startPos.x = null;
    this.startPos.y = null;
    this.currentPos.x = null;
    this.currentPos.y = null;

  }

}

export default Controls;
