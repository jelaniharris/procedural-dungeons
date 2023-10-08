import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControlsEntry, KeyboardControls } from '@react-three/drei';
import { NoToneMapping } from 'three';
import { Controls } from './types/GameTypes';
import createPubSub, { PubSub } from '@/utils/pubSub';
import React from 'react';
import {
  GameObjectRegistry,
  GameObjectRegistryUtils,
} from './GameObjectRegistry';
import { GameObjectRef } from './entities/GameObject';
import { FooterHud } from './hud/FooterHud';
import { Joystick } from './Joystick';

interface GameProps {
  children?: React.ReactNode;
}

export interface GameContextValue extends GameObjectRegistryUtils, PubSub {
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
}

export const GameContext = React.createContext<GameContextValue | null>(null);

export default function Game({ children }: GameProps) {
  const [paused, setPaused] = useState(false);
  const [pubSub] = useState(() => createPubSub());

  const [registryById] = useState<GameObjectRegistry<GameObjectRef>>(
    () => new Map()
  );

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

  const registryUtils = useMemo<GameObjectRegistryUtils>(
    () => ({
      registerGameObject(identifier: symbol, ref: GameObjectRef) {
        // Register game object by id
        registryById.set(identifier, ref);
      },
      unregisterGameObject(identifier: symbol) {
        registryById.delete(identifier);
      },
      getAllRegistryById() {
        return registryById;
      },
    }),
    [registryById]
  );

  const contextValue: GameContextValue = {
    paused,
    setPaused,
    ...pubSub,
    ...registryUtils,
  };

  return (
    <KeyboardControls map={map}>
      <GameContext.Provider value={contextValue}>
        <Canvas
          gl={{ antialias: true, toneMapping: NoToneMapping }}
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor('#252934');
          }}
          className="canvas"
        >
          {children}
        </Canvas>
        <div className="relative">
          <FooterHud />
        </div>
        <Joystick />
      </GameContext.Provider>
    </KeyboardControls>
  );
}
