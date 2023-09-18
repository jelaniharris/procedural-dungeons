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
  aiMove: () => Promise<boolean>;
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
        movementPoints: [],
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
      const newPositions = [];
      //enemy.movementPoints = [];
      if (enemy.status == EnemyStatus.STATUS_ROAMING) {
        let amountOfMoves = 2; //;Math.floor(Math.random() * 3);
        let lastPosition = enemy.position;
        while (amountOfMoves > 0) {
          amountOfMoves--;

          const availableDirections = determineValidDirections(lastPosition, [
            enemy.position,
            ...newPositions,
          ]);
          const randomDirectionIndex = Math.floor(
            Math.random() * availableDirections.length
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

          if (!movementVector.equals(new Vector2(0, 0))) {
            enemy.nextDirection = movementVector;
            const newLocation = new Point2D(
              lastPosition.x + movementVector.x,
              lastPosition.y + movementVector.y
            );

            /*if (checkPointInPoints(newLocation, enemy.movementPoints)) {

            }*/

            newPositions.push(newLocation);
            //enemy.movementPoints.push(newLocation);
            lastPosition = newLocation;
          }
        }
      }
      enemy.movementPoints = newPositions;
    }

    return enemies;
  },
  async aiMove() {
    const currentEnemies = get().enemies;

    let enemyHasMovementLeft = false;
    currentEnemies.forEach((enemy, i) => {
      if (enemy.movementPoints.length > 0) {
        enemyHasMovementLeft = true;
        const nextLocation = enemy.movementPoints.shift();
        //const nextDirection = enemy.nextDirection;
        if (nextLocation && currentEnemies[i]) {
          /*currentEnemies[i].position.x += nextDirection.x;
          currentEnemies[i].position.y += nextDirection.y;
          */
          currentEnemies[i].position.x = nextLocation.x;
          currentEnemies[i].position.y = nextLocation.y;
        }
      }
    });

    console.debug('[aiMove] Done moving AI');

    set({ enemies: currentEnemies });
    return enemyHasMovementLeft;
  },
});
