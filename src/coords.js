
export class Coords {

  constructor(x = null, y = null) {
    this.x = x;
    this.y = y;
  }

  toArray() {
    return [ this.x, this.y ];
  }

  areValid() {
    if (this.x !== null && this.y !== null) {
      return true;
    }
    return false;
  }

  getOffset(coords) {

    if (this.areValid() && coords.areValid()) {
      return [coords.x - this.x, coords.y - this.y];
    }
    return [0, 0];
  }

}
