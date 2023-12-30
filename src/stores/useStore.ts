import { getDailyUniqueSeed } from '@/utils/seed';
import { createWithEqualityFn } from 'zustand/traditional';
import { AudioSlice, createAudioSlice } from './audioSlice';
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
    AudioSlice,
    EnemySlice {
  startGame: (startGameType: string | null) => void;
  assignSeed: (startGameType: string | null) => number;
}

export const useStore = createWithEqualityFn<GameState>(
  (...args) => ({
    ...createStageSlice(...args),
    ...createMapSlice(...args),
    ...createPlayerSlice(...args),
    ...createEnemySlice(...args),
    ...createHazardSlice(...args),
    ...createGeneratorSlice(...args),
    ...createAudioSlice(...args),
    assignSeed: (startGameType: string | null) => {
      const [set, get] = [args[0], args[1]];

      const gameType = startGameType || get().gameType;
      let seed = Math.random() * 10000;

      switch (gameType) {
        case 'daily':
          seed = getDailyUniqueSeed();
          break;
        case 'adventure':
          seed = Math.random() * 100000;
          break;
        default:
          throw new Error(`Unknown game type: ${gameType}`);
      }
      set(() => ({
        seed: seed,
      }));
      return seed;
    },
    startGame: (startGameType: string | null) => {
      const [set, get] = [args[0], args[1]];
      let seed = get().seed;
      const gameType = startGameType || get().gameType;

      if (!seed) {
        seed = get().assignSeed(gameType);
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
