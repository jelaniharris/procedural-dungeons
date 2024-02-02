import { LiquidType, TileType } from '@/components/types/GameTypes';
import { Point2D } from './Point2D';

export const getLiquidTypeFromTileType = (tileType: TileType): LiquidType => {
  switch (tileType) {
    case TileType.TILE_WATER:
      return LiquidType.LIQUID_WATER;
    case TileType.TILE_POISON:
      return LiquidType.LIQUID_POISON;
    case TileType.TILE_MUD:
      return LiquidType.LIQUID_MUD;
    case TileType.TILE_LAVA:
      return LiquidType.LIQUID_LAVA;
    default:
      return LiquidType.LIQUID_NONE;
  }
};

export const getTileTypeFromLiquidType = (liquidType: LiquidType): TileType => {
  let desiredFloorTile = TileType.TILE_NONE;
  switch (liquidType) {
    case LiquidType.LIQUID_WATER:
      desiredFloorTile = TileType.TILE_WATER;
      break;
    case LiquidType.LIQUID_POISON:
      desiredFloorTile = TileType.TILE_POISON;
      break;
    case LiquidType.LIQUID_MUD:
      desiredFloorTile = TileType.TILE_MUD;
      break;
    case LiquidType.LIQUID_LAVA:
      desiredFloorTile = TileType.TILE_LAVA;
      break;
  }
  return desiredFloorTile;
};

export const point2DToString = (location: Point2D): string => {
  return `${location.x},${location.y}`;
};

export const stringToPoint2D = (pointAsStr: string): Point2D => {
  const [x, y] = pointAsStr.split(',');
  return { x: parseInt(x, 10), y: parseInt(y, 10) } as Point2D;
};
