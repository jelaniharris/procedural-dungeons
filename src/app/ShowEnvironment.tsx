import { Column } from '@/components/models/Column';
import Dirt from '@/components/models/Dirt';
import Floor from '@/components/models/Floor';
import FloorDetail from '@/components/models/Floor-detail';
import { LShapeWall } from '@/components/models/LShape-Wall';
import Stairs from '@/components/models/Stairs';
import { ThreeSidedWall } from '@/components/models/Three-Sided-Wall';
import Wall from '@/components/models/Wall';
import WallHalf from '@/components/models/WallHalf';
import WallNarrow from '@/components/models/WallNarrow';
import Water from '@/components/models/Water';
import { TileType, WallType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { MathUtils } from 'three';
import { shallow } from 'zustand/shallow';

export const ShowEnvironment = () => {
  const { mapData, numCols, numRows, determineWallType, getTilePosition } =
    useStore(
      (state) => ({
        mapData: state.mapData,
        numCols: state.numCols,
        numRows: state.numRows,
        determineWallType: state.determineWallType,
        getTilePosition: state.getTilePosition,
      }),
      shallow
    );

  const worldTiles: React.JSX.Element[] = [];

  const determineDynamicFlooring = (xPos: number, yPos: number) => {
    const tileXPos = xPos * TILE_W;
    const tileYPos = yPos * TILE_W;

    const surroundingCoordinates = [
      { x: xPos, y: yPos - 1 },
      { x: xPos + 1, y: yPos },
      { x: xPos, y: yPos + 1 },
      { x: xPos - 1, y: yPos },
    ];

    const floorTypeAmount = new Map<TileType, number>();

    for (const coord of surroundingCoordinates) {
      const tile = getTilePosition(coord.x, coord.y);

      if (tile !== null) {
        if (tile === TileType.TILE_FLOOR || tile === TileType.TILE_FLOOR_ROOM) {
          const amount = floorTypeAmount.get(tile) || 0;
          floorTypeAmount.set(tile, amount + 1);
        }
      }
    }

    let variant = 0;
    if (
      (floorTypeAmount.get(TileType.TILE_FLOOR_ROOM) || 0) >=
      (floorTypeAmount.get(TileType.TILE_FLOOR) || 0)
    ) {
      variant = 1;
    }

    return (
      <Floor
        key={`columnfloor-${xPos}-${yPos}`}
        position={[tileXPos, 0, tileYPos]}
        variant={variant}
      />
    );
  };

  if (!mapData || mapData.length == 0) {
    return <></>;
  }

  console.debug('[ShowEnvironment] RENDERING ENVIRONMENT');

  const TILE_W = 1;

  for (let y = 0; y < numRows; y++) {
    for (let x = 0; x < numCols; x++) {
      const tileType: TileType = mapData[x][y] || TileType.TILE_NONE;

      const tileXPos = x * TILE_W;
      const tileYPos = y * TILE_W;

      let tile: React.JSX.Element[] | null = null;
      switch (tileType) {
        case TileType.TILE_TEST:
          tile = [
            <Water key={`tile-${x}-${y}`} position={[tileXPos, 0, tileYPos]} />,
          ];
          break;
        case TileType.TILE_FLOOR:
        case TileType.TILE_FLOOR_ROOM:
          const randomFloor = Math.random();
          if (randomFloor < 0.8) {
            tile = [
              <Floor
                key={`tile-${x}-${y}`}
                position={[tileXPos, 0, tileYPos]}
                variant={tileType === TileType.TILE_FLOOR_ROOM ? 1 : 0}
              />,
            ];
          } else {
            tile = [
              <FloorDetail
                key={`tiledetail-${x}-${y}`}
                position={[tileXPos, 0, tileYPos]}
                variant={tileType === TileType.TILE_FLOOR_ROOM ? 1 : 0}
              />,
            ];
          }
          break;
        case TileType.TILE_WALL_DOOR:
        case TileType.TILE_WALL:
        case TileType.TILE_WALL_EDGE:
          const { rotation, wallType } = determineWallType(x, y, tileType);
          switch (wallType) {
            case WallType.WALL_DOOR:
              // Actual door is an game object, so just fill in the floor for now
              tile = [
                <Floor
                  key={`doorfloor-${x}-${y}`}
                  position={[tileXPos, 0, tileYPos]}
                  variant={1}
                />,
              ];
              break;
            case WallType.WALL_ENCASED:
              // Fully encased, then convert to DIRT
              tile = [
                <Dirt
                  key={`dirt-${x}-${y}`}
                  position={[tileXPos, 0, tileYPos]}
                />,
              ];
              break;
            case WallType.WALL_OPEN:
              const randomWall = Math.random();
              if (randomWall < 0.25) {
                tile = [
                  <Column
                    key={`column-${x}-${y}`}
                    position={[tileXPos, 0, tileYPos]}
                  />,
                  determineDynamicFlooring(tileXPos, tileYPos),
                ];
              } else {
                tile = [
                  <Wall key={`${x}-${y}`} position={[tileXPos, 0, tileYPos]} />,
                ];
              }
              break;
            case WallType.WALL_TWO_SIDED:
              tile = [
                <WallNarrow
                  key={`wallnarrow-${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />,
              ];
              break;
            case WallType.WALL_TRI_SIDED:
              tile = [
                <ThreeSidedWall
                  key={`tsw-${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />,
              ];
              break;
            case WallType.WALL_L_SHAPE:
              tile = [
                <LShapeWall
                  key={`lsw-${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />,
              ];
              break;
            case WallType.WALL_PARTIAL:
              tile = [
                <WallHalf
                  key={`partial-${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />,
              ];
              break;
          }
          break;
        case TileType.TILE_EXIT:
          tile = [
            <Stairs
              key={`stairs-${x}-${y}`}
              rotation={[0, MathUtils.degToRad(0), 0]}
              position={[tileXPos, 0, tileYPos]}
            />,
          ];
          break;
        case TileType.TILE_NONE:
        default:
          break;
      }

      if (tile) {
        for (const placeTile of tile) {
          worldTiles.push(placeTile);
        }
      }
    }
  }

  // TODO: Look into InstanceMeshes for optimal usage
  return <>{worldTiles}</>;
};
