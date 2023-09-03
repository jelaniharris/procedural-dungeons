import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';

export interface StageSlice {
  currentLevel: number;
  advanceStage: () => void;
}

export const createStageSlice: StateCreator<
  StageSlice & MapSlice,
  [],
  [],
  StageSlice
> = (set, get) => ({
  currentLevel: 0,
  advanceStage() {
    const resetStage = get().resetStage;
    set((stage) => ({ currentLevel: stage.currentLevel + 1 }));
    resetStage();
  },
});
