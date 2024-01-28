import { LiquidType, TileType } from '@/components/types/GameTypes';

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
