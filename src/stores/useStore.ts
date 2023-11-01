import { getDailyUniqueSeed } from '@/utils/seed';
import { createWithEqualityFn } from 'zustand/traditional';
import { EnemySlice, createEnemySlice } from './enemySlice';
import { GeneratorSlice, createGeneratorSlice } from './generatorSlice';
import { HazardSlice, createHazardSlice } from './hazardSlice';
import { MapSlice, createMapSlice } from './mapSlice';
import { PlayerSlice, createPlayerSlice } from './playerSlice';
import { StageSlice, createStageSlice } from './stageSlice';

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
      let seed = Math.random() * 10000;

      switch (gameType) {
        case 'daily':
          seed = getDailyUniqueSeed();
          break;
        default:
          throw new Error(`Unknown game type: ${gameType}`);
      }

      set((state) => ({
        ...state,
        seed: seed,
        gameType: gameType,
        currentLevel: 1,
      }));

      get().resetStage(true);
    },
  }),
  Object.is // not shallow - some bugs to fix yet
);
