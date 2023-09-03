import { create } from 'zustand';
import { MapSlice, createMapSlice } from './mapSlice';
import { PlayerSlice, createPlayerSlice } from './playerSlice';
import { StageSlice, createStageSlice } from './stageSlice';

export interface GameState extends MapSlice, PlayerSlice, StageSlice {
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

export const useStore = create<GameState>((set, get, other) => ({
  ...createStageSlice(set, get, other),
  ...createMapSlice(set, get, other),
  ...createPlayerSlice(set, get, other),
  startGame: () => {
    console.log('Starting game');
    set((state) => ({ ...state, currentLevel: 1 }));
    get().resetStage();
  },
}));
