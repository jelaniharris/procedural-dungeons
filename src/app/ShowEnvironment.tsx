import Dirt from '@/components/models/Dirt';
import Floor from '@/components/models/Floor';
import Stairs from '@/components/models/Stairs';
import { ThreeSidedWall } from '@/components/models/Three-Sided-Wall';
import Wall from '@/components/models/Wall';
import WallHalf from '@/components/models/WallHalf';
import WallNarrow from '@/components/models/WallNarrow';
import { TileType, WallType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { MathUtils } from 'three';
import { shallow } from 'zustand/shallow';

export const ShowEnvironment = () => {
  const { mapData, numCols, numRows, determineWallType } = useStore(
    (state) => ({
      mapData: state.mapData,
      numCols: state.numCols,
      numRows: state.numRows,
      determineWallType: state.determineWallType,
    }),
    shallow
  );

  const worldTiles = [];

  if (!mapData || mapData.length == 0) {
    return <></>;
  }

  console.debug('[ShowEnvironment] RENDERING ENVIRONMENT');

  const TILE_W = 1;

  for (let y = 0; y < numRows; y++) {
    const offsetX = 0;

    for (let x = 0; x < numCols; x++) {
      const tileType: TileType = mapData[x][y] || TileType.TILE_NONE;

      const tileXPos = x * TILE_W + offsetX;
      const tileYPos = y * TILE_W;

      let tile: React.JSX.Element | null = null;
      switch (tileType) {
        case TileType.TILE_FLOOR:
          tile = <Floor key={`${x}-${y}`} position={[tileXPos, 0, tileYPos]} />;
          break;
        case TileType.TILE_WALL:
        case TileType.TILE_WALL_EDGE:
          const { rotation, wallType } = determineWallType(x, y);
          switch (wallType) {
            case WallType.WALL_ENCASED:
              // Fully encased, then convert to DIRT
              tile = (
                <Dirt key={`${x}-${y}`} position={[tileXPos, 0, tileYPos]} />
              );
              break;
            case WallType.WALL_OPEN:
              tile = (
                <Wall key={`${x}-${y}`} position={[tileXPos, 0, tileYPos]} />
              );
              break;
            case WallType.WALL_TWO_SIDED:
              tile = (
                <WallNarrow
                  key={`${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />
              );
              break;
            case WallType.WALL_TRI_SIDED:
              tile = (
                <ThreeSidedWall
                  key={`${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />
              );
              break;
            case WallType.WALL_PARTIAL:
              tile = (
                <WallHalf
                  key={`${x}-${y}`}
                  rotation={[0, rotation, 0]}
                  position={[tileXPos, 0, tileYPos]}
                />
              );
              break;
          }
          break;
        case TileType.TILE_EXIT:
          tile = (
            <Stairs
              key={`${x}-${y}`}
              rotation={[0, MathUtils.degToRad(0), 0]}
              position={[tileXPos, 0, tileYPos]}
            />
          );
          break;
        case TileType.TILE_NONE:
        default:
          break;
      }

      if (tile) {
        worldTiles.push(tile);
      }
    }
  }

  // TODO: Look into InstanceMeshes for optimal usage
  return <>{worldTiles}</>;
};
