import { Point2D } from '../../utils/Point2D';

export enum TileType {
  TILE_NONE,
  TILE_TEST,
  TILE_WATER,
  TILE_FLOOR,
  TILE_FLOOR_ROOM,
  TILE_DIRT,
  TILE_WALL,
  TILE_WALL_EDGE,
  TILE_WALL_DOOR,
  TILE_EXIT,
}

export enum ItemType {
  ITEM_NONE,
  ITEM_COIN,
  ITEM_CHEST,
  ITEM_CHALICE,
  ITEM_CROWN,
  ITEM_POTION,
  ITEM_CHICKEN,
  ITEM_WEAPON,
  ITEM_APPLE,
  ITEM_INGOT_STACK,
}

export enum WallType {
  WALL_OPEN,
  WALL_PARTIAL,
  WALL_TWO_SIDED,
  WALL_TRI_SIDED,
  WALL_L_SHAPE,
  WALL_ENCASED,
  WALL_DOOR,
}

export enum HazardType {
  TRAP_NONE,
  TRAP_FLOOR_SPIKES,
  TRAP_FLOOR_ARROW,
}

export enum EnemyType {
  ENEMY_NONE,
  ENEMY_ORC,
  ENEMY_SKELETON,
  ENEMY_GHOST,
}

export enum EnemyStatus {
  STATUS_NONE,
  STATUS_ROAMING,
  STATUS_HUNTING,
  STATUS_DEAD,
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

export enum UnitTraits {
  NONE = 0,
  NOCLIP = 1 << 0,
  OPENDOORS = 1 << 1,
}

export enum DoorStatus {
  CLOSED,
  OPENED,
}

export type Enemy = {
  id: number;
  type: EnemyType;
  position: Point2D;
  name?: string;
  status: EnemyStatus;
  nextDirection: Point2D;
  traits: UnitTraits;
  movementRange: number;
  movementVariance: number;
  movementPoints: Point2D[];
};

export enum DestructableType {
  NONE,
  BARREL,
  POTTERY,
}

export enum WalkableType {
  BLOCK_NONE,
  BLOCK_WALL,
  BLOCK_DESTRUCTIBLE,
  BLOCK_ENEMY,
}

export type Destructable = {
  id: number;
  type: DestructableType;
  contains: ItemType;
};

export enum TouchControls {
  CONTROL_NONE,
  CONTROL_THIMBLE,
  CONTROL_DPAD,
}

export type GameSettings = {
  sound: boolean;
  soundVolume: number;
  music: boolean;
  musicVolume: number;
  touchControlType: TouchControls;
  provisionUnlocks: boolean[];
};

export enum GameStatus {
  GAME_NONE,
  GAME_STARTED,
  GAME_MENU,
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
  facingDirection?: Direction;
};

export enum LocationActionType {
  NOTHING = 0,
  COLLECTED_ITEM = 1 << 0,
  TOUCHED_PLAYER = 1 << 1,
  AT_EXIT = 1 << 2,
  AT_DOOR = 1 << 3,
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

export type DoorLocation = {
  position: Point2D;
};

export type PlayerType = {
  x: number;
  y: number;
};

export enum SpawnWarningType {
  WARNING_NONE,
  WARNING_ENEMY,
  WARNING_SPELL,
}

export type SpawnWarning = {
  location: Point2D;
  warningType: SpawnWarningType;
  enemyType?: EnemyType;
  timer: number;
};

export type MapArea = {
  locations: Point2D[];
  locationsSet?: Set<string>;
  adjacentWallsSet: Set<string>;
};

export enum SplitType {
  HorizontalSplit,
  VerticalSplit,
}

export type SplitData = {
  type: SplitType;
  splitOriginAxis: number;
  start: number;
  end: number;
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
  options = 'options',
}

export type PlayerLocalData = {
  name: string;
  discriminator: number;
  country: string;
};

export type BlockTestOptions = {
  noClip?: boolean;
  canInteract?: boolean;
  doorIsWall?: boolean;
};

export enum OverLayTextType {
  OVERLAY_NONE,
  OVERLAY_SCORE,
  OVERLAY_HEALTH,
  OVERLAY_WEAPON,
  OVERLAY_ENERGY,
}

export enum ProvisionType {
  NONE,
  SPICES,
  TIN_FLASK,
  BONE_NECKLACE,
  COIN_PURSE,
  WHETSTONE,
  CHAIN_MAIL,
  RESERVED_3,
  RESERVED_4,
  RESERVED_5,
  RESERVED_6,
  RESERVED_7,
  RESERVED_8,
  RESERVED_9,
  RESERVED_10,
  __LAST,
}

export enum SourceType {
  NONE,
  TREASURE,
  KILL,
  POTION,
}

export type Provision = {
  name: string;
  description: string;
  numberValue: number;
  provisionType: ProvisionType;
};

export enum StatusEffectType {
  NONE = 0,
  STARVING = 1 << 0,
  POISON = 1 << 1,
  CONFUSION = 1 << 2,
}

export type StatusEffect = {
  statusEffectType: StatusEffectType;
  duration: number;
  canExpire: boolean;
  canStack: boolean;
};

export enum StatusEffectEvent {
  NONE,
  REMOVED,
  ADDED,
}

export enum ProjectileType {
  NONE,
  BEAM_ARROW,
}

export type Projectile = {
  id: string;
  worldPosition: Point2D;
  destLocation?: Point2D;
  projectileType: ProjectileType;
  travelDirection: Direction;
  travelSpeedPerTile?: number;
  hurtLocations?: Point2D[];
  beforeDestroy?: () => void;
  destroy?: (id?: string) => void;
};
