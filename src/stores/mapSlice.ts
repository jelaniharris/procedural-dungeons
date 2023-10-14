import {
  Direction,
  GameStatus,
  Item,
  ItemType,
  POSITION_OFFSETS,
  TileType,
  WallType,
} from '@/components/types/GameTypes';
import { LootChance } from '@/utils/LootChance';
import { Point2D } from '@/utils/Point2D';
import { checkPointInPoints } from '@/utils/gridUtils';
import { createRef } from 'react';
import { MathUtils } from 'three';
import { StateCreator } from 'zustand';
import { EnemySlice } from './enemySlice';
import { GeneratorSlice } from './generatorSlice';
import { HazardSlice } from './hazardSlice';
import { PlayerSlice } from './playerSlice';
import { StageSlice } from './stageSlice';

export interface MapSlice {
  mapData: (TileType | null)[][];
  numRows: number;
  numCols: number;
  resetStage: (hard: boolean) => void;
  getTilePosition: (x: number, y: number) => TileType | null;
  determineValidDirections: (
    point: Point2D,
    excludedPoints?: Point2D[]
  ) => Direction[];
  isBlockWallOrNull: (e: TileType | null) => boolean;
  determineWallType: (
    x: number,
    y: number
  ) => { rotation: number; wallType: WallType };
  generateMap: (
    mapData: (TileType | null)[][],
    useSeed: number
  ) => (TileType | null)[][];
  getEmptyTiles: () => Point2D[];
  generateExit: () => void;
  generatePlayerPosition: (seed: number) => void;
  resetMap: () => void;
  // Items
  items: Item[];
  itemIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemsRefs: React.MutableRefObject<any[]>;
  generateItems: (seed: number) => void;
  getItemPositionOnGrid: (x: number, y: number) => number;
  getItemPosition: (x: number, y: number) => Item | null;
  resetItems: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allItemRefs = createRef<any[]>() as React.MutableRefObject<any[]>;

export const createMapSlice: StateCreator<
  MapSlice &
    StageSlice &
    PlayerSlice &
    EnemySlice &
    HazardSlice &
    GeneratorSlice,
  [],
  [],
  MapSlice
> = (set, get) => ({
  mapData: [],
  numRows: 5,
  numCols: 5,
  items: [],
  itemIndex: 0,
  itemsRefs: allItemRefs,
  resetStage: (hardReset = false) => {
    const generateItems = get().generateItems;
    const generateExit = get().generateExit;
    const generatePlayerPosition = get().generatePlayerPosition;
    const resetMap = get().resetMap;
    const resetItems = get().resetItems;
    const resetPlayer = get().resetPlayer;
    const generateEnemies = get().generateEnemies;
    const generateHazards = get().generateHazards;
    const resetDangerZones = get().resetDangerZones;
    const assignRandomGenerator = get().assignRandomGenerator;

    resetMap();
    resetItems();

    resetDangerZones();
    if (hardReset) {
      resetPlayer();
    }
    assignRandomGenerator();
    const randomGen = get().randomGen;

    const generatorSeeds = {
      map: randomGen(),
      exit: randomGen(),
      item: randomGen(),
      playerPosition: randomGen(),
    };

    console.log('[resetStage] Generated seeds: ', generatorSeeds);

    const currentMapData = get().mapData;

    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;

    for (let y = 0; y < mapNumRows; y++) {
      for (let x = 0; x < mapNumCols; x++) {
        let tileType: TileType = TileType.TILE_NONE;

        if (x == 0 || x == mapNumCols - 1 || y == 0 || y == mapNumRows - 1) {
          tileType = TileType.TILE_WALL_EDGE;
        }

        if (!currentMapData[x]) {
          currentMapData[x] = [];
        }
        currentMapData[x][y] = tileType;
      }
    }

    console.debug('[resetStage] Stage has been reset');

    get().generateMap(currentMapData, generatorSeeds['map']);

    set({
      mapData: currentMapData,
      gameStatus: GameStatus.GAME_STARTED,
      isPaused: false,
    });
    generateItems(generatorSeeds['item']);
    generatePlayerPosition(generatorSeeds['playerPosition']);
    generateExit();
    generateEnemies();
    generateHazards();
  },
  resetMap: () => {
    const mapNumRows = 15 + 3 * get().currentLevel;
    const mapNumCols = 15 + 3 * get().currentLevel;

    const newMap: (TileType | null)[][] = [];

    for (let y = 0; y < mapNumRows; y++) {
      for (let x = 0; x < mapNumCols; x++) {
        if (!newMap[x]) {
          newMap[x] = [];
        }
        newMap[x][y] = TileType.TILE_NONE;
      }
    }

    set({
      mapData: newMap,
      numRows: mapNumRows,
      numCols: mapNumCols,
    });
  },
  getTilePosition: (x: number, y: number) => {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const currentMapData = get().mapData;
    if (y < 0 || y >= mapNumRows) {
      return null;
    }

    if (x < 0 || x >= mapNumCols) {
      return null;
    }

    return currentMapData[x][y];
  },
  isBlockWallOrNull: (e: TileType | null) => {
    return e == null || e == TileType.TILE_WALL || e == TileType.TILE_WALL_EDGE;
  },
  determineValidDirections: (point: Point2D, excludedPoints?: Point2D[]) => {
    const getTilePosition = get().getTilePosition;
    const isBlockWallOrNull = get().isBlockWallOrNull;

    const validDirections: Direction[] = [];

    for (const posOff of POSITION_OFFSETS) {
      const newPosition = {
        x: point.x + posOff.position.x,
        y: point.y + posOff.position.y,
      };
      const dirTile = getTilePosition(newPosition.x, newPosition.y);
      if (!dirTile) {
        continue;
      }

      if (
        excludedPoints &&
        excludedPoints.length > 0 &&
        checkPointInPoints(newPosition, excludedPoints)
      ) {
        continue;
      }

      if (!isBlockWallOrNull(dirTile)) {
        validDirections.push(posOff.direction);
      }
    }

    return validDirections;
  },
  determineWallType: (x: number, y: number) => {
    let rotation = 0;
    let wallType: WallType = WallType.WALL_OPEN;
    const getTilePosition = get().getTilePosition;
    const isBlockWallOrNull = get().isBlockWallOrNull;

    const northBlock = getTilePosition(x, y - 1);
    const eastBlock = getTilePosition(x + 1, y);
    const southBlock = getTilePosition(x, y + 1);
    const westBlock = getTilePosition(x - 1, y);

    // Create bitwise value
    // N E S W
    let bitwiseWalls = 0;

    if (isBlockWallOrNull(northBlock)) {
      bitwiseWalls = bitwiseWalls | 8; // 1000
    }

    if (isBlockWallOrNull(eastBlock)) {
      bitwiseWalls = bitwiseWalls | 4; // 0100
    }

    if (isBlockWallOrNull(southBlock)) {
      bitwiseWalls = bitwiseWalls | 2; // 0010
    }

    if (isBlockWallOrNull(westBlock)) {
      bitwiseWalls = bitwiseWalls | 1; // 0001
    }
    switch (bitwiseWalls) {
      case 15:
        // 1 1 1 1 = 15
        wallType = WallType.WALL_ENCASED;
        break;
      case 10:
      case 5:
        // 1 0 1 0 = 10
        // 0 1 0 1 = 5
        if (bitwiseWalls == 10) {
          rotation = 90;
        }
        wallType = WallType.WALL_TWO_SIDED;
        break;
      case 8:
      case 4:
      case 2:
      case 1:
        const trisiderotationData = {
          1: 0,
          2: 90,
          4: 180,
          8: 270,
        };
        // 1 0 0 0 = 8
        // 0 1 0 0 = 4
        // 0 0 1 0 = 2
        // 0 0 0 1 = 1
        wallType = WallType.WALL_TRI_SIDED;
        rotation = trisiderotationData[bitwiseWalls] || 0;
        break;

      case 11:
      case 13:
      case 14:
      case 7:
        // 1 0 1 1 = 11
        // 1 1 0 1 = 13
        // 1 1 1 0 = 14
        // 0 1 1 1 = 7
        const partialRotationData = {
          13: 0,
          11: 90,
          14: 270,
          7: 180,
        };
        wallType = WallType.WALL_PARTIAL;
        rotation = partialRotationData[bitwiseWalls] || 0;
        break;
      default:
        wallType = WallType.WALL_OPEN;
        break;
    }

    return {
      rotation: rotation * (Math.PI / 180),
      wallType,
    };
  },
  generateMap(mapData: (TileType | null)[][], useSeed: number) {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const mapRandomGenerator = get().generateGenerator(useSeed);
    console.log(`[generateMap] Using seed ${useSeed}`);

    if (!mapData) {
      return [];
    }

    for (let y = 0; y < mapNumRows; y++) {
      for (let x = 0; x < mapNumCols; x++) {
        if (
          mapData[x][y] == TileType.TILE_WALL ||
          mapData[x][y] == TileType.TILE_WALL_EDGE
        ) {
          continue;
        }
        const rand = Math.floor(mapRandomGenerator() * 4);
        let tileType: TileType = TileType.TILE_NONE;

        switch (rand) {
          case 0:
          case 1:
          case 2:
            tileType = TileType.TILE_FLOOR;
            break;

          case 3:
            tileType = TileType.TILE_WALL;
            break;
        }

        if (!mapData[x]) {
          mapData[x] = [];
        }
        mapData[x][y] = tileType;
      }
    }

    console.debug('[generateMap] Generated Map');

    return mapData;
  },
  resetItems() {
    set({ items: [] });
  },
  getEmptyTiles() {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const currentMapData = get().mapData;
    const isBlockWallOrNull = get().isBlockWallOrNull;
    const getItemPosition = get().getItemPosition;

    const emptySpots = [];

    for (let y = 0; y < mapNumRows; y++) {
      for (let x = 0; x < mapNumCols; x++) {
        if (
          !isBlockWallOrNull(currentMapData[x][y]) &&
          currentMapData[x][y] != TileType.TILE_EXIT &&
          !getItemPosition(x, y)
        ) {
          emptySpots.push({ x: x, y: y });
        }
      }
    }

    return emptySpots;
  },
  generatePlayerPosition(seed: number) {
    let emptySpots = get().getEmptyTiles();
    const psuedoShuffle = get().shuffleArray;
    const randomGen = get().generateGenerator(seed);
    emptySpots = psuedoShuffle(emptySpots, randomGen);

    let position = null;
    while (emptySpots.length != 0 && position == null) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      position = point;
    }
    if (position) {
      set({
        playerPosition: position,
      });
      return true;
    }

    return false;
  },
  generateExit() {
    const currentMapData = get().mapData;
    let emptySpots = get().getEmptyTiles();
    const psuedoShuffle = get().shuffleArray;
    emptySpots = psuedoShuffle(emptySpots);

    let validSpot = false;
    while (emptySpots.length != 0 && validSpot == false) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      console.log('Point ', point.x, ',', point.y);

      currentMapData[point.x][point.y] = TileType.TILE_EXIT;
      validSpot = true;
    }
  },
  generateItems(seed: number) {
    const currentLevel = get().currentLevel;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;
    const itemIndex = get().itemIndex;
    const randomGen = get().generateGenerator(seed);
    const psuedoShuffle = get().shuffleArray;

    let numberItems = 12 + currentLevel * 3;
    let emptySpots = get().getEmptyTiles();
    emptySpots = psuedoShuffle(emptySpots, randomGen);

    let newItemIndex = itemIndex;
    const newItemData: Item[] = [];

    // Create a new LootChance generator
    const lootGen = new LootChance<ItemType>();

    lootGen.add(ItemType.ITEM_COIN, 70);
    lootGen.add(ItemType.ITEM_POTION, 45, 2);
    lootGen.add(ItemType.ITEM_CHALICE, 25, 10);
    lootGen.add(ItemType.ITEM_CHICKEN, 25);

    while (emptySpots.length != 0 && numberItems > 0) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      // Choose the random item
      const randomItem = lootGen.choose(randomGen);

      let newItem: Item = {
        id: newItemIndex,
        type: randomItem === null ? ItemType.ITEM_NONE : randomItem,
        rotates: false,
        position: point,
        modelRotation: { x: 0, y: 0, z: 0 },
        modelPositionOffset: { x: 0, y: 0, z: 0 },
        name: 'coin',
      };

      switch (randomItem) {
        case ItemType.ITEM_COIN:
          newItem = { ...newItem, rotates: true, name: 'coin' };
          break;
        case ItemType.ITEM_CHICKEN:
          newItem = { ...newItem, rotates: true, name: 'chicken_leg' };
          break;
        case ItemType.ITEM_CHALICE:
          newItem = {
            ...newItem,
            rotates: true,
            name: 'chalice',
            modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
          };
          break;
        case ItemType.ITEM_POTION:
          newItem = {
            ...newItem,
            rotates: true,
            name: 'potion',
            modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
          };
          break;
        default:
          continue;
      }

      if (newItem.type != ItemType.ITEM_NONE) {
        newItemData[
          getItemPositionOnGrid(newItem.position.x, newItem.position.y)
        ] = newItem;
      }

      numberItems--;
      newItemIndex++;
    }

    set({
      itemIndex: newItemIndex,
      items: newItemData,
    });

    console.debug(`[generateItems] Generated ${newItemIndex + 1} items`);
  },
  getItemPositionOnGrid(x: number, y: number) {
    const mapNumRows = get().numRows;
    return x + y * mapNumRows;
  },
  getItemPosition(x: number, y: number) {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const items = get().items;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;

    if (y < 0 || y >= mapNumRows) {
      return null;
    }

    if (x < 0 || x >= mapNumCols) {
      return null;
    }

    const location = getItemPositionOnGrid(x, y);
    if (items[location]) {
      return items[location];
    }
    return null;
  },
});
