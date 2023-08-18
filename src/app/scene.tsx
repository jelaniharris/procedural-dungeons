'use client';

import { Canvas } from '@react-three/fiber';
import Floor from '@/components/Floor';
import { Suspense, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import LightBulb from '@/components/LightBulb';
import {
  Stats,
  OrbitControls,
  KeyboardControlsEntry,
  KeyboardControls,
  CameraControls,
  PerspectiveCamera,
  OrbitControlsProps,
} from '@react-three/drei';
import React from 'react';
import Wall from '@/components/Wall';
import { GameProvider, useGameContext } from '@/components/context/GameContext';
import {
  Controls,
  ItemType,
  TileType,
  WallType,
} from '@/components/types/GameTypes';
import Dirt from '@/components/Dirt';
import WallHalf from '@/components/WallHalf';
import { ThreeSidedWall } from '@/components/Three-Sided-wall';
import { WallNarrow } from '@/components/WallNarrow';
import { Coin } from '@/components/Coin';
import { Chest } from '@/components/Chest';
import { MathUtils } from 'three';
import * as THREE from 'three';
import { CharacterHuman } from '@/components/CharacterHuman';
import { useKeyboardControls } from '@react-three/drei';

const Scene = () => {
  const {
    worldData,
    playerData,
    rimWithWalls,
    generateMap,
    generateItems,
    initItemsGrid,
    determineWallType,
  } = useGameContext();

  const orbitControlsRef = useRef<OrbitControlsProps>(null!);
  const cameraRef = useRef();

  const ShowScene = () => {
    const worldTiles = [];

    if (!worldData) {
      return <></>;
    }

    // Generate isometric world...
    const TILE_W = 1;
    //const TILE_W_HALF = TILE_W / 2

    // If row is odd
    /*if (y % 2 !== 0) {
      offsetX = TILE_W_HALF + TILE_W_HALF * 0.4
    }*/

    initItemsGrid();
    rimWithWalls();
    generateMap();
    generateItems();

    console.log('MUFFINS');

    for (let y = 0; y < worldData.numRows; y++) {
      const offsetX = 0;

      for (let x = 0; x < worldData.numCols; x++) {
        const tileType: TileType = worldData.tiles[x][y] || TileType.TILE_NONE;
        const itemType: ItemType | null = worldData.items[x][y];

        const tileXPos = x * TILE_W + offsetX;
        const tileYPos = y * TILE_W;

        let tile: React.JSX.Element | null = null;
        let item: React.JSX.Element | null = null;
        switch (tileType) {
          case TileType.TILE_FLOOR:
            tile = (
              <Floor key={`${x}-${y}`} position={[tileXPos, 0, tileYPos]} />
            );
            break;
          case TileType.TILE_WALL:
          case TileType.TILE_WALL_EDGE:
            const { rotation, wallType } = determineWallType(x, y);
            //console.log(`${x},${y} = ${wallType}`);
            switch (wallType) {
              case WallType.WALL_ENCASED:
                //console.log('Encased at: ', x, ' ', y);
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
          case TileType.TILE_NONE:
          default:
            break;
        }

        switch (itemType) {
          case ItemType.ITEM_COIN:
            item = <Coin position={[tileXPos, 0, tileYPos]} />;
            break;
          case ItemType.ITEM_CHEST:
            item = (
              <Chest
                rotation={[0, MathUtils.degToRad(180), 0]}
                position={[tileXPos, 0, tileYPos]}
              />
            );
            break;
          default:
            break;
        }

        /*const tileXPos = x * TILE_W + offsetX + TILE_W * 0.4 * x
        const tileYPos = y * TILE_W - TILE_W_HALF * 0.6 * y */

        //rotation={[0, 0, (45 * Math.PI) / 180]}
        if (tile) {
          worldTiles.push(tile);
        }
        if (item) {
          worldTiles.push(item);
        }
      }
    }

    return <>{worldTiles}</>;
  };

  const ShowPlayer = () => {
    return (
      <>
        <CharacterHuman />
      </>
    );
  };

  const lookAtVec = new THREE.Vector3(0, 0, 0);
  const cameraVector = new THREE.Vector3(0, 0, 0);
  const cameraPosition = new THREE.Vector3(0, 0, 0);

  useFrame((state) => {
    if (!playerData) {
      return;
    }
    lookAtVec.set(playerData.x, 0, playerData.y);
    cameraVector.lerp(lookAtVec, 0.1);
    cameraPosition.set(playerData.x, 9, playerData.y + 6);
    state.camera.position.lerp(cameraPosition, 0.1);
    state.camera.lookAt(cameraVector);
    state.camera.updateProjectionMatrix();
  });

  return (
    <>
      <directionalLight />
      <Stats />
      <PerspectiveCamera ref={cameraRef} makeDefault position={[6, 3, 6]} />
      <OrbitControls
        ref={orbitControlsRef}
        camera={cameraRef.current}
        enabled={true}
      />
      <gridHelper args={[20, 20, 0xff0000, 'teal']} />
      <Suspense fallback={null}>
        <ShowScene />
        <ShowPlayer />
      </Suspense>
    </>
  );
};

export default Scene;
