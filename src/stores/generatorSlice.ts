import psuedoRandom from '@/utils/randomGenerator';
import { StateCreator } from 'zustand';

export interface GeneratorSlice {
  seed: number;
  randomGen: () => number;
  shuffleArray<T>(arr: T[], useGenerator?: () => number): T[];
  assignRandomGenerator: () => void;
  generateGenerator: (seed: number) => () => number;
}

export const createGeneratorSlice: StateCreator<
  GeneratorSlice,
  [],
  [],
  GeneratorSlice
> = (set, get) => ({
  seed: Math.random(),
  randomGen: Math.random,
  assignRandomGenerator() {
    const seed = get().seed;
    set({
      randomGen: psuedoRandom(seed),
    });
  },
  generateGenerator(seed: number) {
    return psuedoRandom(seed);
  },
  shuffleArray<T>(arr: T[], useGenerator?: () => number): T[] {
    let j, x, index;
    const shuffleRandomGenerator = useGenerator || get().randomGen;

    for (index = arr.length - 1; index > 0; index--) {
      j = Math.floor(shuffleRandomGenerator() * (index + 1));
      x = arr[index];
      arr[index] = arr[j];
      arr[j] = x;
    }
    return arr;
  },
});
