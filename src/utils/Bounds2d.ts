import { SplitData } from '@/components/types/GameTypes';

export class Bounds2D {
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(left: number, right: number, top: number, bottom: number) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
  }

  getWidth() {
    return this.right - this.left + 1;
  }

  getHeight() {
    return this.bottom - this.top + 1;
  }
}

export class Room extends Bounds2D {
  split: SplitData | null = null;
}
