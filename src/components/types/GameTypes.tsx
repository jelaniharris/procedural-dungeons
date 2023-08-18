export enum TileType {
  TILE_NONE,
  TILE_FLOOR,
  TILE_DIRT,
  TILE_WALL,
  TILE_WALL_EDGE,
}

export enum ItemType {
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

export type PlayerType = {
  x: number;
  y: number;
};

export type WorldDataType = {
  numRows: number;
  numCols: number;
  tiles: (TileType | null)[][];
  items: (ItemType | null)[][];
};

export enum Controls {
  forward = 'forward',
  back = 'back',
  left = 'left',
  right = 'right',
  jump = 'jump',
}
