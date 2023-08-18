'use client';

import { useMemo } from 'react';
import {
  KeyboardControlsEntry,
  KeyboardControls,
  Environment,
} from '@react-three/drei';
import React from 'react';
import { GameProvider } from '@/components/context/GameContext';
import Scene from './scene';
import { Controls } from '@/components/types/GameTypes';
import { Canvas } from '@react-three/fiber';
import { NoToneMapping, MathUtils } from 'three';

export default function Home() {
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

  return (
    <KeyboardControls map={map}>
      <GameProvider>
        <Canvas
          gl={{ antialias: true, toneMapping: NoToneMapping }}
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor('#252934');
          }}
          className="canvas"
        >
          <Environment preset="warehouse" />
          <Scene />
        </Canvas>
      </GameProvider>
    </KeyboardControls>
  );
}
