import Point2D from '../../utils/Point2D';

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
}

export enum WallType {
  WALL_OPEN,
  WALL_PARTIAL,
  WALL_TWO_SIDED,
  WALL_TRI_SIDED,
  WALL_ENCASED,
}

export enum LocationActionType {
  NOTHING,
  COLLECTED_ITEM,
  AT_EXIT,
}

export type Item = {
  id: number;
  type: ItemType;
  rotates: boolean;
  position: Point2D;
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
}
