import { TileType } from '@/components/types/GameTypes';

// Taken from: https://stackoverflow.com/a/72732727
const psuedoRandom = (seed: number) => {
  const m = 2 ** 35 - 31;
  const a = 185852;
  let s = seed % m;
  return function () {
    return (s = (s * a) % m) / m;
  };
};

export const getRandomRangeInt = (
  generator: () => number,
  min: number,
  max: number
) => {
  return Math.floor(generator() * (max - min + 1)) + min;
};

export const randomizeFloorOrWall = (
  generator: () => number,
  wallChance: number,
  otherType = TileType.TILE_FLOOR
) => {
  const rand = generator();
  let tileType = otherType;
  if (rand <= wallChance) {
    tileType = TileType.TILE_WALL;
  }
  return tileType;
};

export default psuedoRandom;
