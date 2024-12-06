import {
  DangerIndicator,
  DangerType,
  Enemy,
  GameSettings,
  GameStatus,
  LocationActionType,
  ProvisionType,
  TouchControls,
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
    position?: Point2D,
    enemy?: Enemy
  ) => void;
};

export interface StageSlice {
  // Statuses
  gameStatus: GameStatus;
  isPaused: boolean;
  setGameStatus: (newStatus: GameStatus) => void;

  // Stages
  advanceStage: () => void;
  newStageTriggers: () => void;

  // Turns
  performTurn: (props: PerformTurnProps) => void;

  // Game Types
  gameType: string;
  getGameType: () => string;

  // Levels
  currentLevel: number;
  getCurrentLevel: () => number;

  // Danger Zones
  dangerZones: DangerType[];
  resetDangerZones: () => void;
  addLocationsToDangerZones: (
    locations: Point2D[],
    dangerIndicator?: DangerIndicator
  ) => void;

  // Dialogs
  showExitDialog: boolean;
  showSettingsDialog: boolean;
  showStoreDialog: boolean;
  setShowExitDialog: (showDialog: boolean) => void;
  setShowSettingsDialog: (showDialog: boolean) => void;
  setShowStoreDialog: (showStoreDialog: boolean) => void;
  setPaused: (newPauseStatus: boolean) => void;

  // Floor Steps
  floorSteps: number;
  modifyFloorSteps: (amount: number) => void;
  resetFloorSteps: (amount: number) => void;

  // Attempts
  getAttemptData: () => RunData;
  recordLocalAttempt: () => void;
  getLocalAttempts: (showAllAttempts: boolean) => RunData[];

  // Settings
  settings: GameSettings;
  getSettings: () => GameSettings;
  saveSettings: (settings: GameSettings) => void;
  getLocalSettings: () => GameSettings;
}

const DefaultGameSettings: GameSettings = {
  sound: true,
  music: true,
  musicVolume: 50,
  soundVolume: 50,
  touchControlType: TouchControls.CONTROL_DPAD,
  provisionUnlocks: new Array(Object.keys(ProvisionType).length)
    .fill(false)
    .map((val) => {
      if (
        [
          ProvisionType.BONE_NECKLACE,
          ProvisionType.COIN_PURSE,
          ProvisionType.SPICES,
        ].includes(val)
      ) {
        return true;
      }

      return val;
    }),
};

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
  showSettingsDialog: false,
  showStoreDialog: false,
  isPaused: false,
  floorSteps: 0,
  gameStatus: GameStatus.GAME_NONE,
  dangerZones: [],
  settings: {
    ...DefaultGameSettings,
  },
  gameType: 'daily',
  advanceStage() {
    const resetStage = get().resetStage;
    set((stage) => ({
      currentLevel: stage.currentLevel + 1,
      gameStatus: GameStatus.GAME_STARTED,
    }));
    resetStage(false);
  },
  newStageTriggers() {
    const atFullHealth = get().atFullHealth;
    const adjustCurrency = get().adjustCurrency;
    const studdedBraceletProvision = get().hasProvision(
      ProvisionType.STUDDED_BRACELET
    );
    if (atFullHealth() && studdedBraceletProvision) {
      adjustCurrency(studdedBraceletProvision.numberValue);
    }
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
  setShowSettingsDialog(showDialog: boolean) {
    set({
      showSettingsDialog: showDialog,
    });
  },
  setShowStoreDialog(showStoreDialog: boolean) {
    set({
      showStoreDialog: showStoreDialog,
    });
  },
  resetDangerZones() {
    set({
      dangerZones: [],
    });
  },
  addLocationsToDangerZones(
    locations: Point2D[],
    dangerIndicator = DangerIndicator.DAMAGE
  ) {
    const currentDangerZones = get().dangerZones;

    const newDangerZones = [...currentDangerZones];

    locations.forEach((location) => {
      newDangerZones.push({
        location,
        indicatorType: dangerIndicator,
      } as DangerType);
    });

    set({
      dangerZones: newDangerZones,
    });
  },
  async performTurn({ enemyLocationResultCallback }: PerformTurnProps) {
    const aiMove = get().aiMove;
    const aiCalculateNewDirection = get().aiCalculateNewDirection;
    const flagExpiredEnemies = get().flagExpiredEnemies;
    const filterExpiredEnemies = get().filterExpiredEnemies;

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

    // Calculate the new direction the enemies are going
    let currentEnemies = get().enemies;
    aiCalculateNewDirection(currentEnemies);
    if (flagExpiredEnemies(currentEnemies)) {
      currentEnemies = filterExpiredEnemies(currentEnemies);
    }
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
    const storageName = `AllAttempts`;
    //const seed = get().seed;

    let lastRun: RunData[];
    const lastRunString = localStorage.getItem(storageName);
    if (lastRunString) {
      lastRun = JSON.parse(lastRunString);
    } else {
      lastRun = [];
    }

    // Add latest attempt to the front
    lastRun.unshift({ ...attempt, id: uuidv4() });

    /*lastRun = lastRun.filter((run) => {
      // Filter out daily runs that don't take place today
      if (run.type === 'daily' && run.seed !== getDailyUniqueSeed()) {
        return false;
      }

      //TODO Filter out adventure runs older than 5 days

      return true;
    });*/

    // Save in local storage
    localStorage.setItem(storageName, JSON.stringify(lastRun));
  },
  getLocalAttempts(showAllAttempts = false) {
    const gameType = get().gameType;
    const storageName = `AllAttempts`;

    let allAttempts: RunData[];
    const allAttemptsString = localStorage.getItem(storageName);
    if (allAttemptsString) {
      allAttempts = JSON.parse(allAttemptsString);
    } else {
      allAttempts = [];
    }

    if (!showAllAttempts) {
      allAttempts = allAttempts.filter((run) => {
        if (run.type !== gameType) {
          return false;
        }
        return true;
      });
    }

    return allAttempts;
  },
  getLocalSettings() {
    let settings: GameSettings;
    const allSettings = localStorage.getItem('settings');
    if (allSettings) {
      settings = JSON.parse(allSettings);
      console.log('Loding game settings: ', settings);

      if (!settings.provisionUnlocks) {
        settings.provisionUnlocks = DefaultGameSettings.provisionUnlocks;
      }
    } else {
      settings = {
        ...DefaultGameSettings,
      };
    }
    set({ settings: settings });
    return settings;
  },
  getSettings() {
    return get().settings;
  },
  modifyFloorSteps(amount: number) {
    const nextStep = get().floorSteps + amount;
    //if (nextStep < 0) nextStep = 0;
    set({ floorSteps: nextStep });
  },
  resetFloorSteps(amount: number) {
    set({ floorSteps: amount });
  },
  saveSettings(settings: GameSettings) {
    set({ settings: settings });
    localStorage.setItem('settings', JSON.stringify(settings));
  },
  getCurrentLevel() {
    return get().currentLevel;
  },
  getGameType() {
    return get().gameType;
  },
});
