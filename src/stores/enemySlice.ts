import {
  Direction,
  Enemy,
  EnemyStatus,
  EnemyType,
  TileType,
} from '@/components/types/GameTypes';
import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';
import shuffle from 'lodash/shuffle';
import { StageSlice } from './stageSlice';
import Point2D from '@/utils/Point2D';
import { Vector2 } from 'three';

export interface EnemySlice {
  enemies: Enemy[];
  generateEnemies: () => void;
  enemyIndex: number;
  aiMove: () => void;
  aiCalculateNewDirection: (enemies: Enemy[]) => void;
}

export const createEnemySlice: StateCreator<
  EnemySlice & MapSlice & StageSlice,
  [],
  [],
  EnemySlice
> = (set, get) => ({
  enemies: [],
  enemyIndex: 0,
  generateEnemies() {
    let emptySpots = get().getEmptyTiles();
    const enemyIndex = get().enemyIndex;
    const currentLevel = get().currentLevel;
    const currentMapData = get().mapData;
    emptySpots = shuffle(emptySpots);

    let newEnemyIndex = enemyIndex;
    const newEnemyData: Enemy[] = [];

    let numberEnemies = 5 + 2 + currentLevel;

    while (emptySpots.length != 0 && numberEnemies > 0) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      // Do not generate enemies on an exit point
      if (currentMapData[point.x][point.y] == TileType.TILE_EXIT) {
        continue;
      }

      const newEnemy: Enemy = {
        id: newEnemyIndex,
        type: EnemyType.ENEMY_ORC,
        position: point,
        name: 'Orc',
        status: EnemyStatus.STATUS_ROAMING,
        nextDirection: new Point2D(0, 0),
      };

      newEnemyData.push(newEnemy);

      numberEnemies--;
      newEnemyIndex++;
    }

    set({
      enemyIndex: newEnemyIndex,
      enemies: newEnemyData,
    });

    console.debug(`[generateEnemies] Generated ${newEnemyIndex + 1} enemies`);
  },
  aiCalculateNewDirection(enemies: Enemy[]) {
    const determineValidDirections = get().determineValidDirections;

    for (const enemy of enemies) {
      if (enemy.status == EnemyStatus.STATUS_ROAMING) {
        const availableDirections = determineValidDirections(enemy.position);
        const randomDirectionIndex = Math.floor(
          Math.random() * (availableDirections.length + 1)
        );
        const selectedDirection = availableDirections[randomDirectionIndex];
        let movementVector = new Vector2(0, 0);

        switch (selectedDirection) {
          case Direction.DIR_NORTH:
            movementVector = new Vector2(0, -1);
            break;
          case Direction.DIR_EAST:
            movementVector = new Vector2(1, 0);
            break;
          case Direction.DIR_SOUTH:
            movementVector = new Vector2(0, 1);
            break;
          case Direction.DIR_WEST:
            movementVector = new Vector2(-1, 0);
            break;
          default:
            movementVector = new Vector2(0, 0);
            break;
        }

        enemy.nextDirection = movementVector;
      }
    }
    return enemies;
  },
  aiMove() {
    const currentEnemies = get().enemies;
    const aiCalculateNewDirection = get().aiCalculateNewDirection;

    currentEnemies.forEach((enemy, i) => {
      const nextDirection = enemy.nextDirection;
      if (nextDirection && currentEnemies[i]) {
        currentEnemies[i].position.x += nextDirection.x;
        currentEnemies[i].position.y += nextDirection.y;
      }
    });

    aiCalculateNewDirection(currentEnemies);

    console.debug('[aiMove] Done moving AI');

    set({ enemies: currentEnemies });
  },
});
