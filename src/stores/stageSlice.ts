import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';
import { EnemySlice } from './enemySlice';
import {
  Enemy,
  GameStatus,
  LocationActionType,
} from '@/components/types/GameTypes';
import { Point2D } from '@/utils/Point2D';
import { HazardSlice } from './hazardSlice';

export type PerformTurnProps = {
  enemyLocationResultCallback?: (
    location: LocationActionType,
    enemy: Enemy
  ) => void;
};

export interface StageSlice {
  currentLevel: number;
  dangerZones: Point2D[];
  showExitDialog: boolean;
  gameStatus: GameStatus;
  setGameStatus: (newStatus: GameStatus) => void;
  advanceStage: () => void;
  performTurn: (props: PerformTurnProps) => void;
  resetDangerZones: () => void;
  addLocationsToDangerZones: (locations: Point2D[]) => void;
  setShowExitDialog: (showDialog: boolean) => void;
}

export const createStageSlice: StateCreator<
  StageSlice & MapSlice & EnemySlice & HazardSlice,
  [],
  [],
  StageSlice
> = (set, get) => ({
  currentLevel: 0,
  showExitDialog: false,
  gameStatus: GameStatus.GAME_NONE,
  dangerZones: [],
  advanceStage() {
    const resetStage = get().resetStage;
    set((stage) => ({
      currentLevel: stage.currentLevel + 1,
      gameStatus: GameStatus.GAME_STARTED,
    }));
    resetStage(false);
  },
  setGameStatus(newStatus: GameStatus) {
    set({
      gameStatus: newStatus,
    });
  },
  setShowExitDialog(showDialog: boolean) {
    set({
      showExitDialog: showDialog,
    });
  },
  resetDangerZones() {
    set({
      dangerZones: [],
    });
  },
  addLocationsToDangerZones(locations: Point2D[]) {
    const currentDangerZones = get().dangerZones;
    set({
      dangerZones: [...currentDangerZones, ...locations],
    });
  },
  async performTurn({ enemyLocationResultCallback }: PerformTurnProps) {
    const aiMove = get().aiMove;
    const aiCalculateNewDirection = get().aiCalculateNewDirection;

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
    aiCalculateNewDirection(currentEnemies);
    set({ enemies: currentEnemies });
  },
});
