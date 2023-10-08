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
  startGame: (startGameType: string | null) => void;
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
    startGame: (startGameType: string | null) => {
      const [set, get] = [args[0], args[1]];

      const gameType = startGameType || get().gameType;
      let seed = 0;

      switch (gameType) {
        case 'daily':
          const dailyUniqueDate = new Date()
            .toISOString() //2023-10-08T20:48:34.378Z
            .substring(0, 10)
            .replaceAll('-', '');
          seed = parseInt(dailyUniqueDate, 10);
          break;
        default:
          seed = 100 * Math.random();
      }

      set((state) => ({
        ...state,
        randomGen: psuedoRandom(seed),
        gameType: gameType,
        currentLevel: 1,
      }));

      get().resetStage(true);
    },
  }),
  Object.is // not shallow - some bugs to fix yet
);
