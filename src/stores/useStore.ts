import { MapSlice, createMapSlice } from './mapSlice';
import { PlayerSlice, createPlayerSlice } from './playerSlice';
import { StageSlice, createStageSlice } from './stageSlice';
import { EnemySlice, createEnemySlice } from './enemySlice';
import { createWithEqualityFn } from 'zustand/traditional';
import { HazardSlice, createHazardSlice } from './hazardSlice';
import psuedoRandom from '@/utils/randomGenerator';
import { GeneratorSlice, createGeneratorSlice } from './generatorSlice';

export interface GameState
  extends MapSlice,
    PlayerSlice,
    StageSlice,
    HazardSlice,
    GeneratorSlice,
    EnemySlice {
  startGame: (seed: number) => void;
}

export const playAudio = (path: string, volume = 1, callback?: () => void) => {
  const audio = new Audio(`./sounds/${path}`);
  if (callback) {
    audio.addEventListener('ended', callback);
  }
  audio.volume = volume;
  audio.play();
};

export const useStore = createWithEqualityFn<GameState>(
  (...args) => ({
    ...createStageSlice(...args),
    ...createMapSlice(...args),
    ...createPlayerSlice(...args),
    ...createEnemySlice(...args),
    ...createHazardSlice(...args),
    ...createGeneratorSlice(...args),
    startGame: (seed: number) => {
      const [set, get] = [args[0], args[1]];
      set((state) => ({
        ...state,
        randomGen: psuedoRandom(seed),
        currentLevel: 1,
      }));

      for (let p = 5; p > 0; p--) {
        console.log(get().randomGen());
      }

      get().resetStage(true);
    },
  }),
  Object.is // shallow
);
