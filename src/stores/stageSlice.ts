import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';
import { EnemySlice } from './enemySlice';

export interface StageSlice {
  currentLevel: number;
  advanceStage: () => void;
  performTurn: () => void;
}

export const createStageSlice: StateCreator<
  StageSlice & MapSlice & EnemySlice,
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
  async performTurn() {
    const aiMove = get().aiMove;
    const aiCalculateNewDirection = get().aiCalculateNewDirection;

    let hasMovesLeft = true;
    while (hasMovesLeft) {
      hasMovesLeft = await aiMove();
      if (hasMovesLeft) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
    const currentEnemies = get().enemies;
    aiCalculateNewDirection(currentEnemies);
    set({ enemies: currentEnemies });
  },
});
