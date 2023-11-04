'use client';

import createPubSub, { PubSub } from '@/utils/pubSub';
import { KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import React, { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { NoToneMapping } from 'three';
import {
  GameObjectRegistry,
  GameObjectRegistryUtils,
} from './GameObjectRegistry';
import { GameObjectRef } from './entities/GameObject';
import { FooterHud } from './hud/FooterHud';
import { Loading } from './hud/Loading';
import MainMenu from './hud/MainMenu';
import { Controls } from './types/GameTypes';

interface GameProps {
  children?: React.ReactNode;
}

export interface GameContextValue extends GameObjectRegistryUtils, PubSub {
  paused: boolean;
  setPaused: Dispatch<SetStateAction<boolean>>;
  currentHud: string;
  setCurrentHud: Dispatch<SetStateAction<string>>;
  gameMode: string;
  setGameMode: Dispatch<SetStateAction<string>>;
}

export const GameContext = React.createContext<GameContextValue | null>(null);

export default function Game({ children }: GameProps) {
  const [paused, setPaused] = useState(false);
  const [currentHud, setCurrentHud] = useState('mainmenu');
  const [pubSub] = useState(() => createPubSub());
  const [gameMode, setGameMode] = useState('daily');

  const [registryById] = useState<GameObjectRegistry<GameObjectRef>>(
    () => new Map()
  );

  const ClientJoystick = dynamic(
    () => import('./Joystick').then((module) => module.default),
    { ssr: false }
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
    currentHud,
    setCurrentHud,
    gameMode,
    setGameMode,
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
        <Loading />
        {currentHud && currentHud === 'mainmenu' && (
          <div className="relative">
            <MainMenu />
          </div>
        )}
        {currentHud && currentHud === 'game' && (
          <>
            <ClientJoystick />
            <div className="relative">
              <FooterHud />
            </div>
          </>
        )}
      </GameContext.Provider>
    </KeyboardControls>
  );
}
