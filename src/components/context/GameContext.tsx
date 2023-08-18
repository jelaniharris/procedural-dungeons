import React, { FC, useContext, useState } from 'react';
import {
  ItemType,
  PlayerType,
  TileType,
  WallType,
  WorldDataType,
} from '../types/GameTypes';
import shuffle from 'lodash/shuffle';

export type GameContextType = {
  worldData?: WorldDataType;
  playerData?: PlayerType;
  changeWorldData: (newWorld: WorldDataType) => void;
  rimWithWalls: () => void;
  generateMap: () => void;
  generateItems: () => void;
  initItemsGrid: () => void;
  adjustPlayer: (xOffset: number, yOffset: number) => void;
  determineWallType: (
    x: number,
    y: number
  ) => { rotation: number; wallType: WallType };
};

const GameContext = React.createContext<GameContextType>({});

export const GameProvider: FC = ({ children }) => {
  const [worldData, SetWorldData] = useState<WorldDataType>({
    numRows: 15,
    numCols: 15,
    tiles: [],
    items: [],
  });

  const [playerData, setPlayerData] = useState<PlayerType>({
    x: 5,
    y: 5,
  });

  const changeWorldData = (newWorld: WorldDataType) => {
    SetWorldData(newWorld);
  };

  const initItemsGrid = () => {
    for (let y = 0; y < worldData.numRows; y++) {
      for (let x = 0; x < worldData.numCols; x++) {
        if (!worldData.items[x]) {
          worldData.items[x] = [];
        }
        worldData.items[x][y] = null;

        if (!worldData.tiles[x]) {
          worldData.tiles[x] = [];
        }
        worldData.tiles[x][y] = null;
      }
    }
  };

  const rimWithWalls = () => {
    for (let y = 0; y < worldData.numRows; y++) {
      for (let x = 0; x < worldData.numCols; x++) {
        let tileType: TileType = TileType.TILE_NONE;

        if (
          x == 0 ||
          x == worldData.numCols - 1 ||
          y == 0 ||
          y == worldData.numRows - 1
        ) {
          tileType = TileType.TILE_WALL_EDGE;
        }

        if (!worldData.tiles[x]) {
          worldData.tiles[x] = [];
        }
        worldData.tiles[x][y] = tileType;
      }
    }
    changeWorldData(worldData);
  };

  const generateMap = () => {
    for (let y = 0; y < worldData.numRows; y++) {
      for (let x = 0; x < worldData.numCols; x++) {
        if (
          worldData.tiles[x][y] == TileType.TILE_WALL ||
          worldData.tiles[x][y] == TileType.TILE_WALL_EDGE
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

        if (!worldData.tiles[x]) {
          worldData.tiles[x] = [];
        }
        worldData.tiles[x][y] = tileType;
      }
    }
    changeWorldData(worldData);
  };

  const isBlockWallOrNull = (e: TileType | null) => {
    return e == null || e == TileType.TILE_WALL || e == TileType.TILE_WALL_EDGE;
  };

  const adjustPlayer = (xOffset: number, yOffset: number) => {
    if (
      !isBlockWallOrNull(
        worldData.tiles[playerData.x + xOffset][playerData.y + yOffset]
      )
    ) {
      playerData.x = playerData.x + xOffset;
      playerData.y = playerData.y + yOffset;
      setPlayerData(playerData);
    }
  };

  const generateItems = () => {
    let numberItems = 10;
    let emptySpots = [];

    for (let y = 0; y < worldData.numRows; y++) {
      for (let x = 0; x < worldData.numCols; x++) {
        if (!isBlockWallOrNull(worldData.tiles[x][y])) {
          emptySpots.push([x, y]);
        }
      }
    }

    emptySpots = shuffle(emptySpots);

    while (emptySpots.length != 0 && numberItems > 0) {
      const [x, y] = emptySpots.shift();

      const randomItem = Math.floor(Math.random() * 3);

      let itemType: ItemType | null;
      switch (randomItem) {
        case 0:
        case 1:
          itemType = ItemType.ITEM_COIN;
          break;
        case 2:
        case 3:
          itemType = ItemType.ITEM_CHEST;
          break;
        default:
          itemType = null;
      }
      worldData.items[x][y] = itemType;

      numberItems--;
    }
  };

  const getPosition = (x: number, y: number) => {
    if (y < 0 || y >= worldData.numRows) {
      return null;
    }

    if (x < 0 || x >= worldData.numCols) {
      return null;
    }

    return worldData.tiles[x][y];
  };

  const determineWallType = (x: number, y: number) => {
    let rotation = 0;
    let wallType: WallType = WallType.WALL_OPEN;

    const northBlock = getPosition(x, y - 1);
    const eastBlock = getPosition(x + 1, y);
    const southBlock = getPosition(x, y + 1);
    const westBlock = getPosition(x - 1, y);

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

    //console.log('Bitwise: ', bitwiseWalls);

    return {
      rotation: rotation * (Math.PI / 180),
      wallType,
    };
  };

  return (
    <GameContext.Provider
      value={{
        worldData,
        playerData,
        changeWorldData,
        generateMap,
        generateItems,
        rimWithWalls,
        initItemsGrid,
        adjustPlayer,
        determineWallType,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);

export default GameContext;
