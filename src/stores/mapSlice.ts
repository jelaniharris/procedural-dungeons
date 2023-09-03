import {
  Item,
  ItemType,
  TileType,
  WallType,
} from '@/components/types/GameTypes';
import { StateCreator } from 'zustand';
import { StageSlice } from './stageSlice';
import Point2D from '@/utils/Point2D';
import shuffle from 'lodash/shuffle';
import { createRef } from 'react';

export interface MapSlice {
  mapData: (TileType | null)[][];
  numRows: number;
  numCols: number;
  resetStage: () => void;
  getTilePosition: (x: number, y: number) => TileType | null;
  isBlockWallOrNull: (e: TileType | null) => boolean;
  determineWallType: (
    x: number,
    y: number
  ) => { rotation: number; wallType: WallType };
  generateMap: (mapData: (TileType | null)[][]) => (TileType | null)[][];
  // Items
  items: Item[];
  itemIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemsRefs: React.MutableRefObject<any[]>;
  generateItems: () => void;
  getItemPositionOnGrid: (x: number, y: number) => number;
  getItemPosition: (x: number, y: number) => Item | null;
  resetItems: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allItemRefs = createRef<any[]>() as React.MutableRefObject<any[]>;

export const createMapSlice: StateCreator<
  MapSlice & StageSlice,
  [],
  [],
  MapSlice
> = (set, get) => ({
  mapData: [],
  numRows: 15,
  numCols: 15,
  items: [],
  itemIndex: 0,
  itemsRefs: allItemRefs,
  resetStage: () => {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const currentMapData = get().mapData;
    const generateItems = get().generateItems;

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

    get().generateMap(currentMapData);

    set({
      mapData: currentMapData,
    });
    generateItems();
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
          7: 0,
          14: 90,
          13: 180,
          11: 270,
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
  generateMap(mapData: (TileType | null)[][]) {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;

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
        const rand = Math.floor(Math.random() * 3);
        let tileType: TileType = TileType.TILE_NONE;

        switch (rand) {
          case 0:
          case 1:
            tileType = TileType.TILE_FLOOR;
            break;
          case 2:
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
  generateItems() {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const currentMapData = get().mapData;
    const currentLevel = get().currentLevel;
    const isBlockWallOrNull = get().isBlockWallOrNull;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;
    const itemIndex = get().itemIndex;

    let numberItems = 10 + 2 + currentLevel;
    let emptySpots = [];

    for (let y = 0; y < mapNumRows; y++) {
      for (let x = 0; x < mapNumCols; x++) {
        if (!isBlockWallOrNull(currentMapData[x][y])) {
          emptySpots.push(new Point2D(x, y));
        }
      }
    }

    console.debug(`[generateItems] Found ${emptySpots.length} empty spots`);

    emptySpots = shuffle(emptySpots);
    let newItemIndex = itemIndex;
    const newItemData: Item[] = [];

    while (emptySpots.length != 0 && numberItems > 0) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      const randomItem = Math.floor(Math.random() * 3);

      const newItem: Item = {
        id: newItemIndex,
        type: ItemType.ITEM_NONE,
        rotates: false,
        position: point,
      };

      switch (randomItem) {
        case 0:
        case 1:
          newItem.type = ItemType.ITEM_COIN;
          newItem.rotates = true;
          newItem.name = 'coin';
          break;
        case 2:
        case 3:
          newItem.type = ItemType.ITEM_CHEST;
          newItem.name = 'chest';
          break;
        default:
          newItem.type = ItemType.ITEM_NONE;
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

    // Set as new items
    //setItems(newItemData);
    // Update item index
    //setItemIndex(newItemIndex);
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
