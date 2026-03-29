import { EnvironmentTile, TileConfig } from '@/app/EnvironmentTile';
import { LiquidType, TileType, WallType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { getLiquidTypeFromTileType } from '@/utils/mapUtils';
import { HIDDEN, tileIndex } from '@/utils/visibilityUtils';
import React, { useMemo } from 'react';
import { MathUtils } from 'three';
import { shallow } from 'zustand/shallow';

// ---------------------------------------------------------------------------
// Deterministic per-tile pseudo-random value.
// Replaces Math.random() so tile variants are stable across re-renders.
// ---------------------------------------------------------------------------
function tileRandom(x: number, y: number): number {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return h - Math.floor(h);
}

// ---------------------------------------------------------------------------
// Determine which floor variant to use under a column tile by checking
// which surrounding floor type is more common.
// ---------------------------------------------------------------------------
function computeColumnFloorVariant(
  x: number,
  y: number,
  getTilePosition: (x: number, y: number) => TileType | null
): number {
  const surrounding = [
    { x, y: y - 1 },
    { x: x + 1, y },
    { x, y: y + 1 },
    { x: x - 1, y },
  ];
  const counts = new Map<TileType, number>();
  for (const coord of surrounding) {
    const tile = getTilePosition(coord.x, coord.y);
    if (tile === TileType.TILE_FLOOR || tile === TileType.TILE_FLOOR_ROOM) {
      counts.set(tile, (counts.get(tile) ?? 0) + 1);
    }
  }
  return (counts.get(TileType.TILE_FLOOR_ROOM) ?? 0) >=
    (counts.get(TileType.TILE_FLOOR) ?? 0)
    ? 1
    : 0;
}

// ---------------------------------------------------------------------------
// ShowEnvironment
// ---------------------------------------------------------------------------
const ShowEnvironmentInner = () => {
  const {
    mapData,
    numCols,
    numRows,
    visibilityMap,
    determineWallType,
    determineLiquidWallType,
    getTilePosition,
  } = useStore(
    (state) => ({
      mapData: state.mapData,
      numCols: state.numCols,
      numRows: state.numRows,
      visibilityMap: state.visibilityMap,
      determineWallType: state.determineWallType,
      determineLiquidWallType: state.determineLiquidWallType,
      getTilePosition: state.getTilePosition,
    }),
    shallow
  );

  // Build the full TileConfig array once per floor (mapData change).
  // visibilityMap changes do NOT trigger this — only the per-tile visibility
  // number passed to EnvironmentTile changes, and React.memo skips unchanged tiles.
  const tileConfigs = useMemo((): TileConfig[] => {
    if (!mapData || mapData.length === 0) return [];

    const configs: TileConfig[] = [];

    for (let y = 0; y < numRows; y++) {
      for (let x = 0; x < numCols; x++) {
        const tileType: TileType = mapData[x][y] ?? TileType.TILE_NONE;
        const idx = tileIndex(x, y, numRows);
        const base = { idx, tileXPos: x, tileYPos: y };

        switch (tileType) {
          case TileType.TILE_TEST:
            configs.push({ ...base, kind: 'water_test' });
            break;

          case TileType.TILE_FLOOR:
          case TileType.TILE_FLOOR_ROOM: {
            const detail = tileRandom(x, y) >= 0.8;
            const variant = tileType === TileType.TILE_FLOOR_ROOM ? 1 : 0;
            configs.push({ ...base, kind: 'floor', variant, detail });
            break;
          }

          case TileType.TILE_WATER:
          case TileType.TILE_POISON:
          case TileType.TILE_MUD:
          case TileType.TILE_LAVA: {
            const liquidType = getLiquidTypeFromTileType(tileType);
            if (liquidType === LiquidType.LIQUID_NONE) break;
            const { liquidWallType, rotation } = determineLiquidWallType(x, y);
            configs.push({
              ...base,
              kind: 'liquid',
              liquidType,
              liquidWallType,
              liquidRotation: rotation,
            });
            break;
          }

          case TileType.TILE_WALL_DOOR:
          case TileType.TILE_WALL:
          case TileType.TILE_WALL_EDGE: {
            const { rotation, wallType } = determineWallType(x, y, tileType);
            const radians = MathUtils.degToRad(rotation);
            switch (wallType) {
              case WallType.WALL_DOOR:
                configs.push({ ...base, kind: 'floor', variant: 1, detail: false });
                break;
              case WallType.WALL_ENCASED:
                configs.push({ ...base, kind: 'dirt' });
                break;
              case WallType.WALL_OPEN:
                if (tileRandom(x, y) < 0.25) {
                  configs.push({
                    ...base,
                    kind: 'column',
                    floorVariant: computeColumnFloorVariant(x, y, getTilePosition),
                  });
                } else {
                  configs.push({ ...base, kind: 'wall' });
                }
                break;
              case WallType.WALL_TWO_SIDED:
                configs.push({ ...base, kind: 'wall_narrow', rotation: radians });
                break;
              case WallType.WALL_TRI_SIDED:
                configs.push({ ...base, kind: 'wall_tri', rotation: radians });
                break;
              case WallType.WALL_L_SHAPE:
                configs.push({ ...base, kind: 'wall_l', rotation: radians });
                break;
              case WallType.WALL_PARTIAL:
                configs.push({ ...base, kind: 'wall_half', rotation: radians });
                break;
            }
            break;
          }

          case TileType.TILE_EXIT:
            configs.push({ ...base, kind: 'stairs' });
            break;

          case TileType.TILE_NONE:
          default:
            break;
        }
      }
    }

    return configs;
  }, [mapData, numCols, numRows, determineWallType, determineLiquidWallType, getTilePosition]);

  if (!mapData || mapData.length === 0) {
    return <></>;
  }

  return (
    <>
      {tileConfigs.map((config) => (
        <EnvironmentTile
          key={config.idx}
          config={config}
          visibility={visibilityMap[config.idx] ?? HIDDEN}
        />
      ))}
    </>
  );
};

// TODO: Look into InstancedMesh for further optimisation
export const ShowEnvironment = React.memo(ShowEnvironmentInner);
