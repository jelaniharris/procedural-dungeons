'use client';

import createPubSub, { PubSub } from '@/utils/pubSub';
import {
  KeyboardControls,
  KeyboardControlsEntry,
  useProgress,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { NoToneMapping } from 'three';
import DirectionalPads from './DirectionalPads';
import {
  GameObjectRegistry,
  GameObjectRegistryUtils,
} from './GameObjectRegistry';
import { GuiButtons } from './GuiButtons';
import { GameObjectRef } from './entities/GameObject';
import { EmbarkScreen } from './hud/Embark/EmbarkScreen';
import { GameHud } from './hud/GameHud';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  canvasRef: any;
  setGameMode: Dispatch<SetStateAction<string>>;
}

export const GameContext = React.createContext<GameContextValue | null>(null);

export default function Game({ children }: GameProps) {
  const [paused, setPaused] = useState(false);
  const [currentHud, setCurrentHud] = useState('loading');
  const [pubSub] = useState(() => createPubSub());
  const [gameMode, setGameMode] = useState('daily');
  const canvasRef = useRef(null);
  const { active } = useProgress();

  const [registryById] = useState<GameObjectRegistry<GameObjectRef>>(
    () => new Map()
  );
  const [registryByXY] = useState<GameObjectRegistry<GameObjectRef[]>>(
    () => new Map()
  );

  const [registryByName] = useState<GameObjectRegistry<GameObjectRef>>(
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
      { name: Controls.stats, keys: ['KeyQ', 'KeyR'] },
      { name: Controls.stall, keys: ['Space'] },
      { name: Controls.options, keys: ['Escape'] },
    ],
    []
  );

  const registryUtils = useMemo<GameObjectRegistryUtils>(
    () => ({
      registerGameObject(identifier: symbol, ref: GameObjectRef) {
        // Register game object by id
        registryById.set(identifier, ref);
        // register by name
        if (ref.name) {
          registryByName.set(ref.name, ref);
        }
        // register by x, y
        const { transform } = ref;
        const xy = `${transform.x},${transform.y}`;
        const xyList = registryByXY.get(xy) || [];
        xyList.push(ref);
        registryByXY.set(xy, xyList);
      },
      unregisterGameObject(identifier: symbol, ref: GameObjectRef) {
        // unregister by id
        registryById.delete(identifier);
        // unregister by name
        if (ref.name) {
          registryByName.delete(ref.name);
        }
        // unregister by x, y
        const { transform } = ref;
        const xy = `${transform.x},${transform.y}`;
        const xyList = registryByXY.get(xy);
        xyList?.splice(xyList.indexOf(ref), 1);
      },
      getAllRegistryById() {
        return registryById;
      },
      findGameObjectsByXY(x, y) {
        return (
          registryByXY.get(`${x},${y}`)?.filter((obj) => !obj.disabled) || []
        );
      },
      findGameObjectByName(name) {
        return registryByName.get(name);
      },
    }),
    [registryById, registryByXY]
  );

  const contextValue: GameContextValue = {
    paused,
    setPaused,
    currentHud,
    setCurrentHud,
    gameMode,
    canvasRef,
    setGameMode,
    ...pubSub,
    ...registryUtils,
  };

  useEffect(() => {
    if (!active && currentHud === 'loading') {
      setCurrentHud('mainmenu');
    }
  }, [currentHud, active]);

  return (
    <KeyboardControls map={map}>
      <GameContext.Provider value={contextValue}>
        <Canvas
          gl={{ antialias: true, toneMapping: NoToneMapping }}
          ref={canvasRef}
          shadows
          onCreated={({ gl }) => {
            gl.setClearColor('#252934');
          }}
          className="canvas"
        >
          {children}
        </Canvas>
        {currentHud && currentHud === 'mainmenu' && (
          <div className="relative">
            <MainMenu />
          </div>
        )}
        {currentHud && currentHud === 'embark' && (
          <div className="relative">
            <EmbarkScreen />
          </div>
        )}
        {currentHud && currentHud === 'game' && (
          <>
            <ClientJoystick />
            <div className="">
              <DirectionalPads />
            </div>
            <div className="relative">
              <GameHud />
            </div>
            <GuiButtons />
          </>
        )}
        {currentHud && currentHud === 'loading' && <Loading />}
      </GameContext.Provider>
    </KeyboardControls>
  );
}
