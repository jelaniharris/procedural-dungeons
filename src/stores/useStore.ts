import { MapSlice, createMapSlice } from './mapSlice';
import { PlayerSlice, createPlayerSlice } from './playerSlice';
import { StageSlice, createStageSlice } from './stageSlice';
import { EnemySlice, createEnemySlice } from './enemySlice';
import { createWithEqualityFn } from 'zustand/traditional';

export interface GameState
  extends MapSlice,
    PlayerSlice,
    StageSlice,
    EnemySlice {
  startGame: () => void;
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
    startGame: () => {
      const [set, get] = [args[0], args[1]];
      set((state) => ({ ...state, currentLevel: 1 }));
      get().resetStage(true);
    },
  }),
  Object.is // shallow
);
