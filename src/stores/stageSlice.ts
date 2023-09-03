import { StateCreator } from 'zustand';

export interface StageSlice {
  currentLevel: number;
}

export const createStageSlice: StateCreator<StageSlice, [], [], StageSlice> = (
  set,
  get
) => ({
  currentLevel: 0,
});
