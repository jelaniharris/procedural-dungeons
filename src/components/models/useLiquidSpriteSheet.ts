import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { LinearFilter, TextureLoader } from 'three';
import { LiquidType } from '../types/GameTypes';

export const useLiquidSpriteSheet = (liquidType: LiquidType) => {
  const rows = 2;
  const cols = 2;
  const lspriteSheet = useLoader(TextureLoader, '/textures/liquids.png');
  const spriteSheet = useMemo(() => lspriteSheet.clone(), [lspriteSheet]);
  spriteSheet.minFilter = LinearFilter;
  spriteSheet.repeat.x = 1 / cols;
  spriteSheet.repeat.y = 1 / rows;

  useEffect(() => {
    let col = 0;
    let row = 0;

    switch (liquidType) {
      case LiquidType.LIQUID_WATER:
        row = 0;
        col = 0;
        break;
      case LiquidType.LIQUID_MUD:
        row = 1;
        col = 0;
        break;
      case LiquidType.LIQUID_POISON:
        row = 0;
        col = 1;
        break;
      case LiquidType.LIQUID_LAVA:
        row = 1;
        col = 1;
        break;
      default:
        [row, col] = [0, 0];
        break;
    }

    spriteSheet.offset.x = col / cols;
    spriteSheet.offset.y = 1 - (1 + row) / rows;
  }, [liquidType, spriteSheet.offset]);

  return {
    spriteSheet,
  };
};
