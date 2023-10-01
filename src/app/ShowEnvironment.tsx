import { Column } from '@/components/models/Column';
import Dirt from '@/components/models/Dirt';
import Floor from '@/components/models/Floor';
import FloorDetail from '@/components/models/Floor-detail';
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

  const worldTiles: React.JSX.Element[] = [];

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

      let tile: React.JSX.Element[] | null = null;
      switch (tileType) {
        case TileType.TILE_FLOOR:
          const randomFloor = Math.random();
          if (randomFloor < 0.8) {
            tile = [
              <Floor
                key={`tile-${x}-${y}`}
                position={[tileXPos, 0, tileYPos]}
              />,
            ];
          } else {
            tile = [
              <FloorDetail
                key={`tiledetail-${x}-${y}`}
                position={[tileXPos, 0, tileYPos]}
              />,
            ];
          }

          break;
        case TileType.TILE_WALL:
        case TileType.TILE_WALL_EDGE:
          const { rotation, wallType } = determineWallType(x, y);
          switch (wallType) {
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
                  <Floor
                    key={`columnfloor-${x}-${y}`}
                    position={[tileXPos, 0, tileYPos]}
                  />,
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
