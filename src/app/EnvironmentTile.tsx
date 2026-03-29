import { Column } from '@/components/models/Column';
import Dirt from '@/components/models/Dirt';
import Floor from '@/components/models/Floor';
import FloorDetail from '@/components/models/Floor-detail';
import { LShapeWall } from '@/components/models/LShape-Wall';
import {
  LiquidWallAll,
  LiquidWallType,
} from '@/components/models/LiquidWall-All';
import Stairs from '@/components/models/Stairs';
import { ThreeSidedWall } from '@/components/models/Three-Sided-Wall';
import Wall from '@/components/models/Wall';
import WallHalf from '@/components/models/WallHalf';
import WallNarrow from '@/components/models/WallNarrow';
import Water from '@/components/models/Water';
import { LiquidType } from '@/components/types/GameTypes';
import { EXPLORED, HIDDEN } from '@/utils/visibilityUtils';
import React from 'react';

export const EXPLORED_TINT = 0.2;

// ---------------------------------------------------------------------------
// Discriminated union describing everything needed to render one tile.
// Computed once per floor from mapData — stable during gameplay.
// ---------------------------------------------------------------------------
type TileBase = { idx: number; tileXPos: number; tileYPos: number };

export type TileConfig = TileBase &
  (
    | { kind: 'floor'; variant: number; detail: boolean }
    | { kind: 'wall' }
    | { kind: 'wall_narrow'; rotation: number }
    | { kind: 'wall_tri'; rotation: number }
    | { kind: 'wall_l'; rotation: number }
    | { kind: 'wall_half'; rotation: number }
    | { kind: 'column'; floorVariant: number }
    | { kind: 'dirt' }
    | {
        kind: 'liquid';
        liquidType: LiquidType;
        liquidWallType: LiquidWallType;
        liquidRotation: number;
      }
    | { kind: 'stairs' }
    | { kind: 'water_test' }
  );

// ---------------------------------------------------------------------------
// Single memoized tile — only re-renders when its visibility number changes.
// ---------------------------------------------------------------------------
export const EnvironmentTile = React.memo(function EnvironmentTile({
  config,
  visibility,
}: {
  config: TileConfig;
  visibility: number;
}) {
  const tint = visibility === EXPLORED ? EXPLORED_TINT : undefined;
  const pos: [number, number, number] = [config.tileXPos, 0, config.tileYPos];

  let content: React.JSX.Element | null = null;

  switch (config.kind) {
    case 'floor':
      content = config.detail ? (
        <FloorDetail position={pos} variant={config.variant} tint={tint} />
      ) : (
        <Floor position={pos} variant={config.variant} tint={tint} />
      );
      break;
    case 'wall':
      content = <Wall position={pos} tint={tint} />;
      break;
    case 'wall_narrow':
      content = (
        <WallNarrow
          position={pos}
          rotation={[0, config.rotation, 0]}
          tint={tint}
        />
      );
      break;
    case 'wall_tri':
      content = (
        <ThreeSidedWall
          position={pos}
          rotation={[0, config.rotation, 0]}
          tint={tint}
        />
      );
      break;
    case 'wall_l':
      content = (
        <LShapeWall
          position={pos}
          rotation={[0, config.rotation, 0]}
          tint={tint}
        />
      );
      break;
    case 'wall_half':
      content = (
        <WallHalf
          position={pos}
          rotation={[0, config.rotation, 0]}
          tint={tint}
        />
      );
      break;
    case 'column':
      content = (
        <>
          <Column position={pos} tint={tint} />
          <Floor position={pos} variant={config.floorVariant} tint={tint} />
        </>
      );
      break;
    case 'dirt':
      content = <Dirt position={pos} tint={tint} />;
      break;
    case 'liquid':
      content = (
        <LiquidWallAll
          position={pos}
          rotation={[0, config.liquidRotation, 0]}
          liquidType={config.liquidType}
          wallType={config.liquidWallType}
          tint={tint}
        />
      );
      break;
    case 'stairs':
      content = <Stairs position={pos} tint={tint} />;
      break;
    case 'water_test':
      content = <Water position={pos} tint={tint} />;
      break;
  }

  return <group visible={visibility !== HIDDEN}>{content}</group>;
});
