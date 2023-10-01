import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';
import { EnemySlice } from './enemySlice';
import { Enemy, LocationActionType } from '@/components/types/GameTypes';
import { Point2D } from '@/utils/Point2D';

export type PerformTurnProps = {
  enemyLocationResultCallback?: (
    location: LocationActionType,
    enemy: Enemy
  ) => void;
};

export interface StageSlice {
  currentLevel: number;
  dangerZones: Point2D[];
  advanceStage: () => void;
  performTurn: (props: PerformTurnProps) => void;
  resetDangerZones: () => void;
  addLocationsToDangerZones: (locations: Point2D[]) => void;
}

export const createStageSlice: StateCreator<
  StageSlice & MapSlice & EnemySlice,
  [],
  [],
  StageSlice
> = (set, get) => ({
  currentLevel: 0,
  dangerZones: [],
  advanceStage() {
    const resetStage = get().resetStage;
    set((stage) => ({ currentLevel: stage.currentLevel + 1 }));
    resetStage(false);
  },
  resetDangerZones() {
    set({
      dangerZones: [],
    });
  },
  addLocationsToDangerZones(locations: Point2D[]) {
    const currentDangerZones = get().dangerZones;

    const dangerZones = [...currentDangerZones, ...locations];

    set({
      dangerZones: dangerZones,
    });
  },
  async performTurn({ enemyLocationResultCallback }: PerformTurnProps) {
    const aiMove = get().aiMove;
    const aiCalculateNewDirection = get().aiCalculateNewDirection;
    const resetDangerZones = get().resetDangerZones;

    // All of the enemies move
    let hasMovesLeft = true;
    while (hasMovesLeft) {
      hasMovesLeft = await aiMove({
        enemyLocationResultCallback: enemyLocationResultCallback,
      });
      if (hasMovesLeft) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Then trigger traps

    // Calculate the new direction the enemies are going
    const currentEnemies = get().enemies;
    resetDangerZones();
    aiCalculateNewDirection(currentEnemies);
    set({ enemies: currentEnemies });
  },
});
