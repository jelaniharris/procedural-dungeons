import {
  Enemy,
  GameStatus,
  LocationActionType,
} from '@/components/types/GameTypes';
import { RunData } from '@/components/types/RecordTypes';
import { Point2D } from '@/utils/Point2D';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { EnemySlice } from './enemySlice';
import { GeneratorSlice } from './generatorSlice';
import { HazardSlice } from './hazardSlice';
import { MapSlice } from './mapSlice';
import { PlayerSlice } from './playerSlice';

export type PerformTurnProps = {
  enemyLocationResultCallback?: (
    location: LocationActionType,
    enemy: Enemy
  ) => void;
};

export interface StageSlice {
  currentLevel: number;
  dangerZones: Point2D[];
  gameType: string;
  showExitDialog: boolean;
  gameStatus: GameStatus;
  isPaused: boolean;
  setGameStatus: (newStatus: GameStatus) => void;
  advanceStage: () => void;
  performTurn: (props: PerformTurnProps) => void;
  resetDangerZones: () => void;
  addLocationsToDangerZones: (locations: Point2D[]) => void;
  setShowExitDialog: (showDialog: boolean) => void;
  setPaused: (newPauseStatus: boolean) => void;
  // Attempts
  getAttemptData: () => RunData;
  recordLocalAttempt: () => void;
  getLocalAttempts: () => RunData[];
}

export const createStageSlice: StateCreator<
  StageSlice &
    MapSlice &
    EnemySlice &
    HazardSlice &
    PlayerSlice &
    GeneratorSlice,
  [],
  [],
  StageSlice
> = (set, get) => ({
  currentLevel: 0,
  showExitDialog: false,
  isPaused: false,
  gameStatus: GameStatus.GAME_NONE,
  dangerZones: [],
  gameType: 'daily',
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
  setPaused(newPauseStatus: boolean) {
    set({
      isPaused: newPauseStatus,
    });
  },
  getAttemptData() {
    const currentLevel = get().currentLevel;
    const score = get().score;
    const isDead = get().isDead;

    const runData: RunData = {
      level: currentLevel,
      score: score,
      date: new Date().toLocaleDateString(),
      success: !isDead,
      type: get().gameType,
      seed: get().seed,
    };
    return runData;
  },
  recordLocalAttempt() {
    const attempt = get().getAttemptData();
    const gameType = get().gameType;
    const storageName = `${gameType}Attempts`;
    const seed = get().seed;

    let lastRun: RunData[];
    const lastRunString = localStorage.getItem(storageName);
    if (lastRunString) {
      lastRun = JSON.parse(lastRunString);
    } else {
      lastRun = [];
    }

    // Add latest attempt to the front
    lastRun.unshift({ ...attempt, id: uuidv4() });

    lastRun = lastRun.filter((run) => run.seed === seed);

    // Save in local storage
    localStorage.setItem(storageName, JSON.stringify(lastRun));
  },
  getLocalAttempts() {
    const gameType = get().gameType;
    const storageName = `${gameType}Attempts`;

    let allAttempts: RunData[];
    const allAttemptsString = localStorage.getItem(storageName);
    if (allAttemptsString) {
      allAttempts = JSON.parse(allAttemptsString);
    } else {
      allAttempts = [];
    }
    return allAttempts;
  },
});
