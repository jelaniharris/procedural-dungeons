import { StateCreator } from 'zustand';

export interface GeneratorSlice {
  randomGen: () => number;
  shuffleArray<T>(arr: T[]): T[];
}

export const createGeneratorSlice: StateCreator<
  GeneratorSlice,
  [],
  [],
  GeneratorSlice
> = (set, get) => ({
  randomGen: Math.random,
  shuffleArray<T>(arr: T[]): T[] {
    let j, x, index;
    const randomGen = get().randomGen;

    for (index = arr.length - 1; index > 0; index--) {
      j = Math.floor(randomGen() * (index + 1));
      x = arr[index];
      arr[index] = arr[j];
      arr[j] = x;
    }
    return arr;
  },
});
