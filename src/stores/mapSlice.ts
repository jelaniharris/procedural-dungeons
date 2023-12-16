import {
  BlockTestOptions,
  Destructable,
  DestructableType,
  Direction,
  DoorLocation,
  EnemyType,
  GameStatus,
  Item,
  ItemType,
  MapArea,
  POSITION_OFFSETS,
  SpawnWarning,
  SpawnWarningType,
  SplitData,
  SplitType,
  TileType,
  UnitTraits,
  WalkableType,
  WallType,
} from '@/components/types/GameTypes';
import { Room } from '@/utils/Bounds2d';
import { LootChance } from '@/utils/LootChance';
import { Point2D } from '@/utils/Point2D';
import { Queue } from '@/utils/Queue';
import { checkPointInPoints, pointInAreas } from '@/utils/gridUtils';
import { assignItemDetails } from '@/utils/itemUtils';
import {
  getRandomRangeInt,
  randomizeFloorOrWall,
} from '@/utils/randomGenerator';
import { getSetIntersection, popRandomItemFromSet } from '@/utils/setUtils';
import { createRef } from 'react';
import { StateCreator } from 'zustand';
import { AudioSlice } from './audioSlice';
import { EnemySlice } from './enemySlice';
import { GeneratorSlice } from './generatorSlice';
import { HazardSlice } from './hazardSlice';
import { PlayerSlice } from './playerSlice';
import { StageSlice } from './stageSlice';

export interface MapSlice {
  mapData: (TileType | null)[][];
  destructables: Map<string, Destructable>;
  spawnWarnings: Map<string, SpawnWarning>;
  numRows: number;
  numCols: number;
  resetStage: (hard: boolean) => void;
  getTilePosition: (x: number, y: number) => TileType | null;
  determineValidDirections: (
    point: Point2D,
    excludedPoints?: Point2D[],
    traits?: UnitTraits
  ) => Direction[];
  isBlockWallOrNull: (
    e: TileType | null,
    options?: BlockTestOptions
  ) => boolean;
  checkAllLocationsForWalls: (
    mapData: (TileType | null)[][],
    locations: Point2D[]
  ) => boolean;
  countSurroundingWalls: (
    mapData: (TileType | null)[][],
    location: Point2D
  ) => number;

  determineWallType: (
    x: number,
    y: number,
    tileType?: TileType
  ) => { rotation: number; wallType: WallType };
  generateMap: (
    mapData: (TileType | null)[][],
    useSeed: number
  ) => (TileType | null)[][];
  getEmptyTiles: () => Point2D[];
  generateExit: () => void;
  generatePlayerPosition: (seed: number) => void;
  resetMap: () => void;
  fillMapGaps: (
    mapData: (TileType | null)[][],
    allMapAreas: MapArea[]
  ) => (TileType | null)[][];
  checkIfWalkable: (
    location: Point2D,
    hasTraits?: UnitTraits
  ) => { result: boolean; type: WalkableType };

  // Areas
  getAreasFromMap: (mapData: (TileType | null)[][]) => MapArea[];
  getAdjacentArea: (location: Point2D) => MapArea;
  generateDoors: (
    mapData: (TileType | null)[][],
    seed: number,
    allMapAreas: MapArea[]
  ) => void;

  // Danger Mode
  addSpawnWarning: (warning: SpawnWarning) => void;
  executeDangerMode: () => void;
  resetSpawnWarnings: () => void;
  clearSpawnWarning: (warning: SpawnWarning) => void;

  // Rooms
  binarySplitMap: (
    mapData: (TileType | null)[][],
    seed: number,
    minWidth: number,
    minHeight: number
  ) => { rooms: Room[]; splits: SplitData[] };
  createRooms: (
    mapData: (TileType | null)[][],
    seed: number,
    rooms: Room[]
    //splits: SplitData[]
  ) => void;
  isBlockDoorCandidate: (
    mapData: (TileType | null)[][],
    location: Point2D
  ) => boolean;

  // Destructibles
  reduceHealthDestructible: (location: Point2D) => DestructableType;
  spawnDestructableItem: (
    destructable: Destructable,
    location: Point2D
  ) => void;

  // Doors
  doors: DoorLocation[];

  // Items
  items: Item[];
  itemIndex: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  itemsRefs: React.MutableRefObject<any[]>;
  generateItems: (seed: number) => void;
  getItemPositionOnGrid: (x: number, y: number) => number;
  getItemPosition: (x: number, y: number) => Item | null;
  resetItems: () => void;
  addItem: (item: ItemType, location: Point2D) => void;
  checkDangerState: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const allItemRefs = createRef<any[]>() as React.MutableRefObject<any[]>;

export const createMapSlice: StateCreator<
  MapSlice &
    StageSlice &
    PlayerSlice &
    EnemySlice &
    HazardSlice &
    AudioSlice &
    GeneratorSlice,
  [],
  [],
  MapSlice
> = (set, get) => ({
  mapData: [],
  numRows: 5,
  numCols: 5,
  items: [],
  doors: [],
  spawnWarnings: new Map<string, SpawnWarning>(),
  destructables: new Map<string, Destructable>(),
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
    const fillMapGaps = get().fillMapGaps;
    const resetSpawnWarnings = get().resetSpawnWarnings;

    resetMap();
    resetItems();

    resetDangerZones();
    resetSpawnWarnings();
    if (hardReset) {
      resetPlayer();
    }
    assignRandomGenerator();
    const randomGen = get().randomGen;

    const generatorSeeds = {
      map: randomGen(),
      rooms: randomGen(),
      roomContents: randomGen(),
      roomDoors: randomGen(),
      exit: randomGen(),
      item: randomGen(),
      playerPosition: randomGen(),
      enemies: randomGen(),
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

    const stepsUntilHurryUp = Math.floor((mapNumRows * mapNumCols) / 3 / 5) * 5;
    get().resetFloorSteps(stepsUntilHurryUp);

    console.debug('[resetStage] Stage has been reset');

    get().generateMap(currentMapData, generatorSeeds['map']);

    const { rooms } = get().binarySplitMap(
      currentMapData,
      generatorSeeds['rooms'],
      6,
      6
    );
    get().createRooms(currentMapData, generatorSeeds['roomContents'], rooms);

    const allMapAreas: MapArea[] = get().getAreasFromMap(currentMapData);
    fillMapGaps(currentMapData, allMapAreas);
    get().generateDoors(
      currentMapData,
      generatorSeeds['roomDoors'],
      allMapAreas
    );

    set({
      mapData: currentMapData,
      gameStatus: GameStatus.GAME_STARTED,
      isPaused: false,
    });
    generateItems(generatorSeeds['item']);
    generatePlayerPosition(generatorSeeds['playerPosition']);
    generateExit();
    generateEnemies(generatorSeeds['enemies']);
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
      doors: [],
      destructables: new Map<string, Destructable>(),
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
  isBlockWallOrNull: (
    e: TileType | null,
    options: BlockTestOptions | undefined
  ): boolean => {
    // No clip on, then only consider wall edges as impassible
    if (options) {
      // If no clip on, the only consider wall edges as impassible
      if (options.noClip) {
        // If empty tilespace, or wall edge
        return e == null || e == TileType.TILE_WALL_EDGE;
      }

      // IF tile is wall door tile
      if (e == TileType.TILE_WALL_DOOR) {
        // If they can't interact
        if (!options.canInteract) {
          return false;
        }
        if (options.doorIsWall) {
          return true;
        }
      }
    }

    return e == null || e == TileType.TILE_WALL || e == TileType.TILE_WALL_EDGE;
  },
  reduceHealthDestructible: (location: Point2D) => {
    const destructables = get().destructables;
    const playAudio = get().playAudio;
    const spawnDestructableItem = get().spawnDestructableItem;
    const locationString = `${location.x},${location.y}`;
    if (destructables.has(locationString)) {
      const destructable = destructables.get(locationString);
      if (destructable) {
        const preType = destructable?.type || DestructableType.NONE;
        const newDestruct = new Map<string, Destructable>(destructables);

        spawnDestructableItem(destructable, location);

        newDestruct.delete(locationString);
        playAudio('wood_crack.ogg');
        set(() => ({
          destructables: newDestruct, // new Map<string, Destructable>(destructables),
        }));
        return preType;
      }
    }
    return DestructableType.NONE;
  },
  checkIfWalkable: (
    location: Point2D,
    hasTraits: UnitTraits = UnitTraits.NONE
  ) => {
    const mapData = get().mapData;
    const isBlockWallOrNull = get().isBlockWallOrNull;
    const destructables = get().destructables;

    const hasNoClip = (hasTraits & UnitTraits.NOCLIP) === UnitTraits.NOCLIP;

    // If location is a wall
    if (
      isBlockWallOrNull(mapData[location.x][location.y], { noClip: hasNoClip })
    ) {
      return { result: false, type: WalkableType.BLOCK_WALL };
    }

    // If location has a barrel
    if (destructables.has(`${location.x},${location.y}`)) {
      return { result: false, type: WalkableType.BLOCK_DESTRUCTIBLE };
    }

    return { result: true, type: WalkableType.BLOCK_NONE };
  },
  countSurroundingWalls: (
    mapData: (TileType | null)[][],
    location: Point2D
  ) => {
    const isBlockWallOrNull = get().isBlockWallOrNull;
    let countOfWalls = 0;
    // Calculate the location of the currounded coordinates
    const surroundingCoordinates = [
      { x: location.x, y: location.y - 1 },
      { x: location.x + 1, y: location.y },
      { x: location.x, y: location.y + 1 },
      { x: location.x - 1, y: location.y },
    ];

    surroundingCoordinates.forEach((coordinate) => {
      if (isBlockWallOrNull(mapData[coordinate.x][coordinate.y])) {
        countOfWalls++;
      }
    });

    return countOfWalls;
  },
  determineValidDirections: (
    point: Point2D,
    excludedPoints?: Point2D[],
    traits = UnitTraits.NONE
  ) => {
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

      if (
        !isBlockWallOrNull(dirTile, {
          noClip: (traits & UnitTraits.NOCLIP) == UnitTraits.NOCLIP,
          canInteract: (traits & UnitTraits.OPENDOORS) == UnitTraits.OPENDOORS,
        })
      ) {
        validDirections.push(posOff.direction);
      }
    }

    return validDirections;
  },
  determineWallType: (x: number, y: number, tileType?: TileType) => {
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

    if (isBlockWallOrNull(northBlock, { doorIsWall: true })) {
      bitwiseWalls = bitwiseWalls | 8; // 1000
    }

    if (isBlockWallOrNull(eastBlock, { doorIsWall: true })) {
      bitwiseWalls = bitwiseWalls | 4; // 0100
    }

    if (isBlockWallOrNull(southBlock, { doorIsWall: true })) {
      bitwiseWalls = bitwiseWalls | 2; // 0010
    }

    if (isBlockWallOrNull(westBlock, { doorIsWall: true })) {
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
        let spinDirection = 90;
        if (Math.random() < 0.5) {
          spinDirection = 270;
        }
        if (tileType === TileType.TILE_WALL_DOOR) {
          if (bitwiseWalls == 5) {
            rotation = spinDirection;
          }
          wallType = WallType.WALL_DOOR;
        } else {
          if (bitwiseWalls == 10) {
            rotation = spinDirection;
          }
          wallType = WallType.WALL_TWO_SIDED;
        }
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
      case 3:
      case 9:
      case 12:
      case 6:
        // 0 0 1 1 = 3
        // 1 0 0 1 = 9
        // 1 1 0 0 = 12
        // 0 1 1 0 = 6
        const lRotationData = {
          3: 90,
          9: 0,
          12: 270,
          6: 180,
        };
        wallType = WallType.WALL_L_SHAPE;
        rotation = lRotationData[bitwiseWalls] || 0;
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
        // If already a wall then don't do anything
        if (
          mapData[x][y] == TileType.TILE_WALL ||
          mapData[x][y] == TileType.TILE_WALL_EDGE
        ) {
          continue;
        }

        const tileType = randomizeFloorOrWall(mapRandomGenerator, 0.2);

        if (!mapData[x]) {
          mapData[x] = [];
        }
        mapData[x][y] = tileType;
      }
    }

    console.debug('[generateMap] Generated Map');

    return mapData;
  },
  checkAllLocationsForWalls(
    mapData: (TileType | null)[][],
    locations: Point2D[]
  ) {
    const isBlockWallOrNull = get().isBlockWallOrNull;
    for (const location of locations) {
      if (!isBlockWallOrNull(mapData[location.x][location.y])) {
        return false;
      }
    }

    return true;
  },
  isBlockDoorCandidate(mapData: (TileType | null)[][], location: Point2D) {
    const checkAllLocationsForWalls = get().checkAllLocationsForWalls;
    const countSurroundingWalls = get().countSurroundingWalls;
    let isCandidate = false;

    // Check north south direction
    const northSouthCoordinates = [
      { x: location.x, y: location.y - 1 },
      { x: location.x, y: location.y + 1 },
    ];

    const eastWestCoordinates = [
      { x: location.x - 1, y: location.y },
      { x: location.x + 1, y: location.y },
    ];

    const northSouthSpan = checkAllLocationsForWalls(
      mapData,
      northSouthCoordinates
    );
    const eastWestSpan = checkAllLocationsForWalls(
      mapData,
      eastWestCoordinates
    );

    if (countSurroundingWalls(mapData, location) !== 2) {
      return false;
    }

    if (
      (northSouthSpan && !eastWestSpan) ||
      (eastWestSpan && !northSouthSpan)
    ) {
      isCandidate = true;
    }

    return isCandidate;
  },
  getAdjacentArea(location: Point2D): MapArea {
    const getTilePosition = get().getTilePosition;
    const isBlockWallOrNull = get().isBlockWallOrNull;

    const areaLocations: Point2D[] = [];
    const areaCache: Set<string> = new Set<string>();
    const locationsToVisit: Point2D[] = [location];
    const toVisitCache: Set<string> = new Set<string>();
    const adjacentSet: Set<string> = new Set<string>();

    //console.log('Gettling area for location: ', location);

    while (locationsToVisit.length > 0) {
      const currentLocation = locationsToVisit.shift();

      if (!currentLocation) continue;

      // Check if we've already been here
      if (areaCache.has(`${currentLocation.x},${currentLocation.y}`)) {
        continue;
      }

      const currentTile = getTilePosition(currentLocation.x, currentLocation.y);
      if (isBlockWallOrNull(currentTile)) {
        continue;
      }

      // Add open location to area
      //console.log('Adding to area: ', currentLocation);
      areaLocations.push(currentLocation);
      areaCache.add(`${currentLocation.x},${currentLocation.y}`);

      // Calculate the location of the currounded coordinates
      const surroundingCoordinates = [
        { x: currentLocation.x, y: currentLocation.y - 1 },
        { x: currentLocation.x + 1, y: currentLocation.y },
        { x: currentLocation.x, y: currentLocation.y + 1 },
        { x: currentLocation.x - 1, y: currentLocation.y },
      ];

      surroundingCoordinates.forEach((coordinate) => {
        const coordinateHash = `${coordinate.x},${coordinate.y}`;
        // If this coordinate is already in our visit in the future cache, then continue
        if (toVisitCache.has(coordinateHash)) {
          return;
        }
        // If this is already defined as an area, then continue
        if (areaCache.has(coordinateHash)) {
          return;
        }

        // Check if this tile position is a block
        const tilePosition = getTilePosition(coordinate.x, coordinate.y);
        if (isBlockWallOrNull(tilePosition)) {
          // If the type of block is an all edge, and if it's not a internal block
          if (tilePosition != TileType.TILE_WALL_EDGE) {
            // Add to adjacent wall list
            adjacentSet.add(coordinateHash);
          }
        } else {
          // add empty spot for next to visit
          locationsToVisit.push(coordinate);
          toVisitCache.add(coordinateHash);
        }
      });
    }

    return {
      locations: areaLocations,
      adjacentWallsSet: adjacentSet,
      locationsSet: areaCache,
    };
  },
  getAreasFromMap(mapData: (TileType | null)[][]): MapArea[] {
    const mapNumRows = get().numRows;
    const mapNumCols = get().numCols;
    const isBlockWallOrNull = get().isBlockWallOrNull;
    const newAreas: MapArea[] = [];

    for (let y = 0; y < mapNumRows; y++) {
      for (let x = 0; x < mapNumCols; x++) {
        // if wall then continue
        if (isBlockWallOrNull(mapData[x][y])) {
          //console.log(`${x}, ${y} is a wall`);
          continue;
        }

        if (pointInAreas({ x, y }, newAreas)) {
          //console.log(`${x}, ${y} is already in an area`);
          continue;
        }

        //console.log(`${x}, ${y} NOT in an area`);
        // point does not existin areas, so then create a new area from that point
        const newArea = get().getAdjacentArea({ x, y });
        //console.log(`${x}, ${y} created an area: `, newArea);
        // Add the area made to the list
        newAreas.push(newArea);
      }
    }

    //console.log('Areas from map', newAreas);

    return newAreas;
  },
  createRooms(
    mapData: (TileType | null)[][],
    seed: number,
    rooms: Room[]
    //splits: SplitData[]
  ) {
    const randomGen = get().generateGenerator(seed);
    const MAP_WIDTH = mapData[0].length - 1;
    const MAP_HEIGHT = mapData.length - 1;
    const addedDestructables: Map<string, Destructable> = get().destructables;

    // Create a new LootChance generator
    const lootGen = new LootChance<ItemType>();

    lootGen.add(ItemType.ITEM_NONE, 45);
    lootGen.add(ItemType.ITEM_COIN, 25);
    lootGen.add(ItemType.ITEM_CHICKEN, 5);
    lootGen.add(ItemType.ITEM_APPLE, 15);
    lootGen.add(ItemType.ITEM_WEAPON, 5);
    lootGen.add(ItemType.ITEM_POTION, 5);

    for (const room of rooms) {
      for (let x = room.left - 1; x <= room.right + 1; x++) {
        for (let y = room.top - 1; y <= room.bottom + 1; y++) {
          let desiredTile = TileType.TILE_NONE;
          if (
            x == room.left - 1 ||
            x == room.right + 1 ||
            y == room.top - 1 ||
            y == room.bottom + 1
          ) {
            desiredTile = TileType.TILE_WALL;
          } else {
            desiredTile = randomizeFloorOrWall(
              randomGen,
              0.15,
              TileType.TILE_FLOOR_ROOM
            );
            if (desiredTile != TileType.TILE_FLOOR_ROOM && randomGen() < 0.3) {
              const randomItemType = lootGen.choose(randomGen);

              addedDestructables.set(`${x},${y}`, {
                id: Math.random() * 10000,
                type: DestructableType.BARREL,
                contains: randomItemType || ItemType.ITEM_NONE,
              });
              desiredTile = TileType.TILE_FLOOR_ROOM;
            }
          }

          // If within bounds of the map
          if (x >= 0 && x <= MAP_WIDTH && y >= 0 && y <= MAP_HEIGHT) {
            if (mapData[x][y] === TileType.TILE_WALL_EDGE) {
              continue;
            }
            mapData[x][y] = desiredTile;
          }
        }
      }
    }

    set({ destructables: addedDestructables });

    /*for (const room of rooms) {
      for (let x = room.left; x <= room.right; x++) {
        for (let y = room.top; y <= room.bottom; y++) {
          if (
            //mapData[x][y] !== TileType.TILE_WALL ||
            mapData[x][y] !== TileType.TILE_WALL_EDGE
          ) {
            mapData[x][y] = randomizeFloorOrWall(
              randomGen,
              0.1,
              TileType.TILE_TEST
            );
          }
        }
      }
    }*/

    //console.log(mapData[0].length, mapData.length);
    //console.log(rooms, splits);

    // for (const split of splits) {
    //   /*for (const room of rooms) {
    //   const split = room.split;
    //   if (!split) continue;*/
    //   switch (split.type) {
    //     case SplitType.HorizontalSplit:
    //       for (let x = split.start; x <= split.end; x++) {
    //         mapData[x][split.splitOriginAxis] = TileType.TILE_WALL;
    //       }
    //       break;
    //     case SplitType.VerticalSplit:
    //       for (let y = split.start; y <= split.end; y++) {
    //         mapData[split.splitOriginAxis][y] = TileType.TILE_WALL;
    //       }
    //       break;
    //   }
    // }
  },
  binarySplitMap(
    mapData: (TileType | null)[][],
    seed: number,
    minWidth: number,
    minHeight: number
  ): { rooms: Room[]; splits: SplitData[] } {
    const randomGen = get().generateGenerator(seed);

    const roomsQueue: Queue<Room> = new Queue();
    const roomsList: Room[] = [];
    const splits: SplitData[] = [];

    const spaceToSplit: Room = new Room(
      0,
      mapData[0].length - 1,
      0,
      mapData.length - 1
    );

    const SplitHorizontally = (
      minHeight: number,
      roomsQueue: Queue<Room>,
      room: Room
    ): SplitData => {
      // Split anywhere in the middle, but not at the edges
      const ySplit = getRandomRangeInt(randomGen, room.top, room.bottom);
      const room1 = new Room(room.left, room.right, room.top, ySplit - 1);
      const room2 = new Room(room.left, room.right, ySplit + 1, room.bottom);
      const splitInfo = {
        type: SplitType.HorizontalSplit,
        splitOriginAxis: ySplit,
        start: room.left,
        end: room.right,
      };
      room1.split = splitInfo;
      room2.split = splitInfo;
      roomsQueue.enqueue(room1);
      roomsQueue.enqueue(room2);
      return splitInfo;
    };

    const SplitVertically = (
      minWidth: number,
      roomsQueue: Queue<Room>,
      room: Room
    ) => {
      // Split anywhere in the middle, but not at the edges
      const xSplit = getRandomRangeInt(randomGen, room.left, room.right);
      const room1 = new Room(room.left, xSplit - 1, room.top, room.bottom);
      const room2 = new Room(xSplit + 1, room.right, room.top, room.bottom);
      const splitInfo = {
        type: SplitType.VerticalSplit,
        splitOriginAxis: xSplit,
        start: room.top,
        end: room.bottom,
      };
      room1.split = splitInfo;
      room2.split = splitInfo;
      roomsQueue.enqueue(room1);
      roomsQueue.enqueue(room2);
      return splitInfo;
    };

    roomsQueue.enqueue(spaceToSplit);
    while (roomsQueue.length > 0) {
      const room = roomsQueue.dequeue();
      let split;
      if (room.getHeight() >= minHeight && room.getWidth() > minWidth) {
        if (randomGen() < 0.5) {
          // Split Horizontally
          if (room.getHeight() >= minHeight * 2) {
            split = SplitHorizontally(minHeight, roomsQueue, room);
            splits.push(split);
          } else if (room.getWidth() >= minWidth * 2) {
            split = SplitVertically(minWidth, roomsQueue, room);
            splits.push(split);
          } else {
            roomsList.push(room);
          }
        } else {
          // Split Vertically
          if (room.getWidth() >= minWidth * 2) {
            split = SplitVertically(minWidth, roomsQueue, room);
            splits.push(split);
          } else if (room.getHeight() >= minHeight * 2) {
            split = SplitHorizontally(minHeight, roomsQueue, room);
            splits.push(split);
          } else {
            roomsList.push(room);
          }
        }
      }
    }
    return { rooms: roomsList, splits };
  },
  generateDoors(
    mapData: (TileType | null)[][],
    seed: number,
    allMapAreas: MapArea[]
  ) {
    const createdDoors: DoorLocation[] = [];
    const randomGen = get().generateGenerator(seed);
    const isBlockDoorCandidate = get().isBlockDoorCandidate;
    for (let areaA = 0; areaA < allMapAreas.length; areaA++) {
      for (let areaB = areaA + 1; areaB < allMapAreas.length; areaB++) {
        const sharedWalls = getSetIntersection(
          allMapAreas[areaA].adjacentWallsSet,
          allMapAreas[areaB].adjacentWallsSet
        );
        if (sharedWalls.size == 0) {
          continue;
        }

        let doorAmounts = Math.floor(randomGen() * 3) + 1;
        while (doorAmounts > 0 && sharedWalls.size > 0) {
          const position = popRandomItemFromSet(sharedWalls, randomGen);
          const [x, y] = position.split(',');
          const xPos = parseInt(x, 10);
          const yPos = parseInt(y, 10);

          if (isBlockDoorCandidate(mapData, { x: xPos, y: yPos })) {
            createdDoors.push({
              position: { x: xPos, y: yPos },
            });
            mapData[xPos][yPos] = TileType.TILE_WALL_DOOR;
            doorAmounts--;
          }
        }
      }
    }

    set({ doors: createdDoors });
  },
  fillMapGaps(mapData: (TileType | null)[][], allMapAreas: MapArea[]) {
    allMapAreas.forEach((area) => {
      if (area.locations.length <= 4) {
        area.locations.forEach((location) => {
          mapData[location.x][location.y] = TileType.TILE_WALL;
        });
      }
    });

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

      //console.log('Point ', point.x, ',', point.y);

      currentMapData[point.x][point.y] = TileType.TILE_EXIT;
      validSpot = true;
    }
  },
  spawnDestructableItem(destructable: Destructable, location: Point2D) {
    const addItem = get().addItem;

    if (destructable.contains != ItemType.ITEM_NONE) {
      addItem(destructable.contains, location);
    }
  },
  generateItems(seed: number) {
    const currentLevel = get().currentLevel;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;
    const itemIndex = get().itemIndex;
    const randomGen = get().generateGenerator(seed);
    const psuedoShuffle = get().shuffleArray;

    let numberItems = 15 + currentLevel * 4;
    let emptySpots = get().getEmptyTiles();
    emptySpots = psuedoShuffle(emptySpots, randomGen);

    let newItemIndex = itemIndex;
    const newItemData: Item[] = [];

    // Create a new LootChance generator
    const lootGen = new LootChance<ItemType>();

    lootGen.add(ItemType.ITEM_COIN, 65);
    lootGen.add(ItemType.ITEM_CHICKEN, 25);
    lootGen.add(ItemType.ITEM_CHALICE, 17, 10);
    lootGen.add(ItemType.ITEM_WEAPON, 20);
    lootGen.add(ItemType.ITEM_CROWN, 15, 1);
    lootGen.add(ItemType.ITEM_POTION, 8, 2);

    while (emptySpots.length != 0 && numberItems > 0) {
      const point = emptySpots.shift();

      if (!point) {
        break;
      }

      // Choose the random item
      const randomItem = lootGen.choose(randomGen);

      const newItem = assignItemDetails(randomItem, point, newItemIndex);

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
  addItem(itemType: ItemType, location: Point2D) {
    const items = get().items;
    let newItemIndex = get().itemIndex;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;

    const newItem = assignItemDetails(itemType, location, newItemIndex);
    const newItems = [...items];
    newItems[getItemPositionOnGrid(newItem.position.x, newItem.position.y)] =
      newItem;

    newItemIndex++;

    set({
      itemIndex: newItemIndex,
      items: newItems,
    });
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
  resetSpawnWarnings() {
    set({
      spawnWarnings: new Map<string, SpawnWarning>(),
    });
  },
  clearSpawnWarning(warning: SpawnWarning) {
    const spawnWarnings = get().spawnWarnings;
    const newWarnings = new Map<string, SpawnWarning>(spawnWarnings);

    newWarnings.delete(`${warning.location.x},${warning.location.y}`);

    set({
      spawnWarnings: newWarnings,
    });
  },
  addSpawnWarning(warning: SpawnWarning) {
    const spawnWarnings = get().spawnWarnings;
    const newWarnings = new Map<string, SpawnWarning>(spawnWarnings);
    newWarnings.set(`${warning.location.x},${warning.location.y}`, warning);

    set({
      spawnWarnings: newWarnings,
    });
  },
  executeDangerMode(): boolean {
    const psuedoShuffle = get().shuffleArray;
    let emptySpots = get().getEmptyTiles();
    emptySpots = psuedoShuffle(emptySpots, Math.random);

    if (emptySpots.length === 0) {
      return false;
    }

    const location = emptySpots.shift();
    if (!location) {
      return false;
    }

    get().addSpawnWarning({
      location,
      warningType: SpawnWarningType.WARNING_ENEMY,
      enemyType: EnemyType.ENEMY_GHOST,
      timer: 3,
    });
    return true;
  },
  checkDangerState() {
    const floorSteps = get().floorSteps;

    if (floorSteps < 0 && floorSteps % 8 == 0) {
      console.log('Spawning enemy');
      get().executeDangerMode();
    }
  },
});
