'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Stats,
  Environment,
  KeyboardControlsEntry,
  KeyboardControls,
} from '@react-three/drei';
import React from 'react';
import { CharacterController } from '@/components/CharacterController';
import { ShowEnvironment } from '../../app/ShowEnvironment';
import { NoToneMapping } from 'three';
import { GameState, playAudio, useStore } from '@/stores/useStore';
import { FollowCamera } from '../FollowCamera';
import { ShowItems } from '@/app/ShowItems';
import { AmbientSound } from '../AmbientSound';
import { Controls, LocationActionType } from '../types/GameTypes';
import { ShowEnemies } from '@/app/ShowEnemies';
import { ShowEnemyIntention } from '@/app/ShowEnemyIntentions';
const DungeonScene = () => {
  const startGame = useStore((state: GameState) => state.startGame);
  const advanceStage = useStore((state: GameState) => state.advanceStage);
  const performTurn = useStore((state: GameState) => state.performTurn);
  const checkPlayerLocation = useStore(
    (state: GameState) => state.checkPlayerLocation
  );

  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.jump, keys: ['Space'] },
    ],
    []
  );

  console.log('Rendering Scene');

  React.useEffect(() => {
    const party = async () => {
      startGame();
    };
    party();
  }, []);

  const aiTurn = () => {
    performTurn();
  };

  const playerAction = (moved = false) => {
    if (moved) {
      playAudio('stepstone_1.wav', 0.2);
    }
    console.log(`Player action happened: ${moved}`);
    const locationAction = checkPlayerLocation();
    switch (locationAction) {
      case LocationActionType.COLLECTED_ITEM:
        playAudio('coin.wav');
        break;
      case LocationActionType.AT_EXIT:
        console.log('AT EXIT');
        advanceStage();
        break;
      case LocationActionType.NOTHING:
      default:
        break;
    }
    aiTurn();
  };

  return (
    <KeyboardControls map={map}>
      <Canvas
        gl={{ antialias: true, toneMapping: NoToneMapping }}
        shadows
        onCreated={({ gl }) => {
          gl.setClearColor('#252934');
        }}
        className="canvas"
      >
        <directionalLight />
        <Environment preset="warehouse" />
        <Stats />
        <gridHelper args={[20, 20, 0xff0000, 'teal']} />
        <Suspense fallback={null}>
          <AmbientSound url={'./sounds/dungeon_ambient_1.ogg'} />
          <FollowCamera />
          <ShowEnvironment />
          <CharacterController movementCallback={playerAction} />
          <ShowItems />
          <ShowEnemies />
          <ShowEnemyIntention />
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
};

export default DungeonScene;
