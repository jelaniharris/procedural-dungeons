export class Queue<T> {
  items: T[];
  headIndex: number;
  tailIndex: number;

  constructor() {
    this.items = [];
    this.headIndex = 0;
    this.tailIndex = 0;
  }

  enqueue(item: T) {
    this.items[this.tailIndex] = item;
    this.tailIndex++;
  }

  dequeue() {
    this.validation();
    const item = this.items[this.headIndex];
    delete this.items[this.headIndex];
    this.headIndex++;
    return item;
  }

  peek() {
    this.validation();
    return this.items[this.headIndex];
  }

  isEmpty() {
    return this.length === 0;
  }

  private validation() {
    if (this.headIndex === this.tailIndex) {
      throw new Error('Cannot perform operation on an empty queue.');
    }
  }

  get length() {
    return this.tailIndex - this.headIndex;
  }
}
