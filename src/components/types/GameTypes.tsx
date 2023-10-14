import { Point2D } from '../../utils/Point2D';

export enum TileType {
  TILE_NONE,
  TILE_FLOOR,
  TILE_DIRT,
  TILE_WALL,
  TILE_WALL_EDGE,
  TILE_EXIT,
}

export enum ItemType {
  ITEM_NONE,
  ITEM_COIN,
  ITEM_CHEST,
  ITEM_CHALICE,
  ITEM_POTION,
  ITEM_CHICKEN,
}

export enum WallType {
  WALL_OPEN,
  WALL_PARTIAL,
  WALL_TWO_SIDED,
  WALL_TRI_SIDED,
  WALL_ENCASED,
}

export enum HazardType {
  TRAP_FLOOR_SPIKES,
}

export enum EnemyType {
  ENEMY_ORC,
}

export enum EnemyStatus {
  STATUS_NONE,
  STATUS_ROAMING,
  STATUS_HUNTING,
}

export enum Direction {
  DIR_NORTH,
  DIR_EAST,
  DIR_SOUTH,
  DIR_WEST,
  DIR_NONE,
}

export const DIRECTIONS = [
  Direction.DIR_NORTH,
  Direction.DIR_EAST,
  Direction.DIR_SOUTH,
  Direction.DIR_WEST,
];

export enum TravellingDirection {
  DIR_NORTH_SOUTH,
  DIR_EAST_WEST,
  DIR_WEST_SOUTH,
  DIR_EAST_SOUTH,
  DIR_WEST_NORTH,
  DIR_EAST_NORTH,
  DIR_TURN,
}

export enum PathCurves {
  PATH_ORIGIN,
  PATH_STRAIGHT,
  PATH_CURVE,
  PATH_DESTINATION,
}

export const POSITION_OFFSETS = [
  {
    direction: Direction.DIR_NORTH,
    position: { x: 0, y: -1 },
  },
  {
    direction: Direction.DIR_EAST,
    position: { x: 1, y: 0 },
  },
  {
    direction: Direction.DIR_SOUTH,
    position: { x: 0, y: 1 },
  },
  {
    direction: Direction.DIR_WEST,
    position: { x: -1, y: 0 },
  },
];

export type Enemy = {
  id: number;
  type: EnemyType;
  position: Point2D;
  name?: string;
  status: EnemyStatus;
  nextDirection: Point2D;
  movementPoints: Point2D[];
};

export enum GameStatus {
  GAME_NONE,
  GAME_STARTED,
  GAME_EXITDECISION,
  GAME_ENDED,
}

export type BaseGameObject = {
  worldPosition: Point2D;
};

export type Hazard = BaseGameObject & {
  id: string;
  type: HazardType;
  name?: string;
  isActive: boolean;
  currentPhase: number;
  maxPhase: number;
};

export enum LocationActionType {
  NOTHING,
  COLLECTED_ITEM,
  TOUCHED_PLAYER,
  AT_EXIT,
}

export type Point3D = {
  x: number;
  y: number;
  z: number;
};

export type Item = {
  id: number;
  type: ItemType;
  rotates: boolean;
  position: Point2D;
  modelRotation: Point3D;
  modelPositionOffset: Point3D;
  name?: string;
};

export type ItemLocationType = {
  type: ItemType;
  ref?: React.ReactNode;
  id?: number;
};

export type PlayerType = {
  x: number;
  y: number;
};

export type WorldDataType = {
  numRows: number;
  numCols: number;
  tiles: (TileType | null)[][];
};

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
  stall = 'stall',
}
