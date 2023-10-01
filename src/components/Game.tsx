import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControlsEntry, KeyboardControls } from '@react-three/drei';
import { NoToneMapping } from 'three';
import { Controls } from './types/GameTypes';
import createPubSub, { PubSub } from '@/utils/pubSub';
import React from 'react';

interface GameProps {
  children?: React.ReactNode;
}

export interface GameContextValue extends PubSub {
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}

export const GameContext = React.createContext<GameContextValue | null>(null);

export default function Game({ children }: GameProps) {
  const [paused, setPaused] = useState(false);
  const [pubSub] = useState(() => createPubSub());
  const map = useMemo<KeyboardControlsEntry<Controls>[]>(
    () => [
      { name: Controls.forward, keys: ['ArrowUp', 'KeyW'] },
      { name: Controls.back, keys: ['ArrowDown', 'KeyS'] },
      { name: Controls.left, keys: ['ArrowLeft', 'KeyA'] },
      { name: Controls.right, keys: ['ArrowRight', 'KeyD'] },
      { name: Controls.stall, keys: ['Space'] },
    ],
    []
  );

  const contextValue: GameContextValue = {
    paused,
    setPaused,
    ...pubSub,
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
        <GameContext.Provider value={contextValue}>
          {children}
        </GameContext.Provider>
      </Canvas>
    </KeyboardControls>
  );
}
