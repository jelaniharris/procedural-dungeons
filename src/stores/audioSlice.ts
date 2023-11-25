import { StateCreator } from 'zustand';
import { EnemySlice } from './enemySlice';
import { GeneratorSlice } from './generatorSlice';
import { HazardSlice } from './hazardSlice';
import { MapSlice } from './mapSlice';
import { PlayerSlice } from './playerSlice';
import { StageSlice } from './stageSlice';

export interface AudioSlice {
  playAudio: (path: string, volume?: number, callback?: () => void) => void;
}

export const createAudioSlice: StateCreator<
  AudioSlice &
    MapSlice &
    EnemySlice &
    HazardSlice &
    PlayerSlice &
    StageSlice &
    GeneratorSlice,
  [],
  [],
  AudioSlice
> = (set, get) => ({
  playAudio: (path: string, volume = 1, callback?: () => void) => {
    const settings = get().settings;

    if (!settings.sound) {
      return;
    }

    const audio = new Audio(`./sounds/${path}`);
    if (callback) {
      audio.addEventListener('ended', callback);
    }
    audio.volume = volume * ((settings.soundVolume || 0) / 100);
    audio.play();
  },
});
