class Point2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.x},${this.y}`;
  }

  add(o: Point2D) {
    this.x = this.x + o.x;
    this.y = this.y + o.y;
  }
}

export default Point2D;
