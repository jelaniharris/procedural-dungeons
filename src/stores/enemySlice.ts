import {
  Direction,
  Enemy,
  EnemyStatus,
  EnemyType,
  LocationActionType,
  TileType,
  UnitTraits,
} from '@/components/types/GameTypes';
import { LootChance } from '@/utils/LootChance';
import { Point2D } from '@/utils/Point2D';
import randomIntFromInterval from '@/utils/numberUtils';
import { Vector2 } from 'three';
import { StateCreator } from 'zustand';
import { GeneratorSlice } from './generatorSlice';
import { MapSlice } from './mapSlice';
import { PlayerSlice } from './playerSlice';
import { StageSlice } from './stageSlice';

export interface EnemySlice {
  enemies: Enemy[];
  generateEnemies: (seed: number) => void;
  enemyIndex: number;
  aiMove: (props: AiMoveProps) => Promise<boolean>;
  aiCalculateNewDirection: (enemies: Enemy[]) => void;
  checkEnemyLocation: (
    enemyPosition: Point2D,
    enemy: Enemy
  ) => LocationActionType;
  getEnemiesAtLocation: (location: Point2D) => Enemy[];
  getEnemiesAtPlayerLocation: () => Enemy[];
  removeEnemy: (enemy: Enemy) => void;
}

export interface EnemyLocationResultsCallback {
  locationResult: LocationActionType;
  enemy: Enemy;
}

export type AiMoveProps = {
  enemyLocationResultCallback?: (
    location: LocationActionType,
    position?: Point2D,
    enemy?: Enemy
  ) => void;
};

export const createEnemySlice: StateCreator<
  EnemySlice & MapSlice & StageSlice & PlayerSlice & GeneratorSlice,
  [],
  [],
  EnemySlice
> = (set, get) => ({
  enemies: [],
  enemyIndex: 0,
  generateEnemies(seed: number) {
    let emptySpots = get().getEmptyTiles();
    const enemyIndex = get().enemyIndex;
    const currentLevel = get().currentLevel;
    const currentMapData = get().mapData;
    const randomGen = get().generateGenerator(seed);
    const psuedoShuffle = get().shuffleArray;
    emptySpots = psuedoShuffle(emptySpots, randomGen);

    let newEnemyIndex = enemyIndex;
    const newEnemyData: Enemy[] = [];

    let numberEnemies = 4 + currentLevel * 4;

    // Create a new LootChance generator
    const enemyTypeGenerator = new LootChance<EnemyType>();
    enemyTypeGenerator.add(EnemyType.ENEMY_ORC, 60);
    if (currentLevel > 2) {
      enemyTypeGenerator.add(EnemyType.ENEMY_SKELETON, 35);
    }
    if (currentLevel > 3) {
      enemyTypeGenerator.add(EnemyType.ENEMY_GHOST, 25);
    }

    while (emptySpots.length != 0 && numberEnemies > 0) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      // Do not generate enemies on an exit point
      if (currentMapData[point.x][point.y] == TileType.TILE_EXIT) {
        continue;
      }

      // Choose the random item
      const randomEnemy = enemyTypeGenerator.choose(randomGen);

      let newEnemy: Enemy = {
        id: newEnemyIndex,
        type: randomEnemy === null ? EnemyType.ENEMY_NONE : randomEnemy,
        position: point,
        status: EnemyStatus.STATUS_ROAMING,
        nextDirection: { x: 0, y: 0 },
        movementPoints: [],
        movementRange: 1,
        traits: UnitTraits.NONE,
        movementVariance: 0,
      };

      switch (randomEnemy) {
        case EnemyType.ENEMY_ORC:
          newEnemy = {
            ...newEnemy,
            movementRange: 2,
            name: 'Orc',
            traits: UnitTraits.OPENDOORS,
          };
          break;
        case EnemyType.ENEMY_SKELETON:
          newEnemy = { ...newEnemy, movementVariance: 1, name: 'Skeleton' };
          break;
        case EnemyType.ENEMY_GHOST:
          newEnemy = {
            ...newEnemy,
            movementRange: 1,
            movementVariance: 2,
            name: 'Ghost',
            traits: UnitTraits.NOCLIP,
          };
          break;
        default:
          continue;
      }

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
    const isPlayerTired = get().isTired;
    const addLocationsToDangerZones = get().addLocationsToDangerZones;
    const newDangerSpots: Point2D[] = [];

    for (const enemy of enemies) {
      const newPositions = [];
      //enemy.movementPoints = [];
      if (enemy.status == EnemyStatus.STATUS_ROAMING) {
        const variance = randomIntFromInterval(
          -enemy.movementVariance,
          enemy.movementVariance
        );

        let amountOfMoves = enemy.movementRange + Math.floor(variance);
        if (isPlayerTired) {
          amountOfMoves += enemy.movementRange;
        }
        let lastPosition = enemy.position;
        while (amountOfMoves > 0) {
          amountOfMoves--;

          const availableDirections = determineValidDirections(
            lastPosition,
            [enemy.position, ...newPositions],
            enemy.traits
          );
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
            enemy.nextDirection = { x: movementVector.x, y: movementVector.y };
            const newLocation = {
              x: lastPosition.x + movementVector.x,
              y: lastPosition.y + movementVector.y,
            };

            /*if (checkPointInPoints(newLocation, enemy.movementPoints)) {

            }*/

            newPositions.push(newLocation);
            // If this position covers the exit, then add it as a danger spot
            if (
              get().getTilePosition(newLocation.x, newLocation.y) ==
              TileType.TILE_EXIT
            ) {
              newDangerSpots.push(newLocation);
            }
            //enemy.movementPoints.push(newLocation);
            lastPosition = newLocation;
          }
        }
      }
      enemy.movementPoints = newPositions;
    }

    // Add new locations to the danger zones
    addLocationsToDangerZones(newDangerSpots);

    return enemies;
  },
  getEnemiesAtPlayerLocation(): Enemy[] {
    const playerPosition = get().playerPosition;
    return get().getEnemiesAtLocation(playerPosition);
  },
  getEnemiesAtLocation(location: Point2D): Enemy[] {
    const enemies = get().enemies;
    const enemiesAtLocation = [];

    for (const enemy of enemies) {
      if (enemy.position.x == location.x && enemy.position.y == location.y) {
        enemiesAtLocation.push(enemy);
      }
    }

    return enemiesAtLocation;
  },
  checkEnemyLocation(enemyPosition: Point2D, enemy: Enemy): LocationActionType {
    const mapData = get().mapData;
    const playerPosition = get().playerPosition;
    let locationDetails: LocationActionType = LocationActionType.NOTHING;

    // If enemy is at player position, then
    if (
      enemyPosition.x == playerPosition.x &&
      enemyPosition.y == playerPosition.y
    ) {
      locationDetails = locationDetails | LocationActionType.TOUCHED_PLAYER;
    }

    // If enemy is at a door and they can open doors
    if (
      mapData[enemyPosition.x][enemyPosition.y] == TileType.TILE_WALL_DOOR &&
      (enemy.traits & UnitTraits.OPENDOORS) == UnitTraits.OPENDOORS
    ) {
      locationDetails = locationDetails | LocationActionType.AT_DOOR;
    }

    return locationDetails;
  },
  async aiMove({ enemyLocationResultCallback }: AiMoveProps) {
    const currentEnemies = get().enemies;
    const checkEnemyLocation = get().checkEnemyLocation;

    let enemyHasMovementLeft = false;
    currentEnemies.forEach(async (enemy, i) => {
      if (enemy.movementPoints.length > 0) {
        enemyHasMovementLeft = true;
        const nextLocation = enemy.movementPoints.shift();
        //const nextDirection = enemy.nextDirection;
        if (nextLocation && currentEnemies[i]) {
          /*currentEnemies[i].position.x += nextDirection.x;
          currentEnemies[i].position.y += nextDirection.y;
          */

          // Check the next location has the player
          const locationResult = checkEnemyLocation(nextLocation, enemy);
          if (enemyLocationResultCallback && enemy && locationResult !== 0) {
            enemyLocationResultCallback(locationResult, nextLocation, enemy);
            if (
              (locationResult & LocationActionType.TOUCHED_PLAYER) ==
              LocationActionType.TOUCHED_PLAYER
            ) {
              enemy.movementPoints = [];
              enemyHasMovementLeft = false;
            }
          }

          currentEnemies[i].position.x = nextLocation.x;
          currentEnemies[i].position.y = nextLocation.y;
        }
      }
    });

    //console.debug('[aiMove] Done moving AI');

    set({ enemies: currentEnemies });
    return enemyHasMovementLeft;
  },
  removeEnemy: (enemy: Enemy) => {
    const enemies = get().enemies;
    const oldEnemies = [...enemies];

    console.log('Looking for enemy: ', enemy);
    const index = oldEnemies.findIndex(
      (searchEnemy) => searchEnemy.id == enemy.id
    );
    console.log('Found enemy: ', oldEnemies[index]);
    if (index > 0) {
      oldEnemies[index] = {
        ...oldEnemies[index],
        status: EnemyStatus.STATUS_DEAD,
        movementPoints: [],
      };

      //delete oldEnemies[index];
      set({ enemies: oldEnemies });
      return true;
    }
    return false;
  },
});
