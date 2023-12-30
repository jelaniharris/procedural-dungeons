/* eslint-disable @typescript-eslint/no-explicit-any */
import wait from '@/utils/wait';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CHANGE_SCENE, ChangeSceneEvent } from '../types/EventTypes';
import useGame from '../useGame';

interface SceneManagerProps {
  defaultScene: string;
  children: React.ReactNode;
}

export interface SceneManagerContextValue {
  currentScene: string;
  setScene: (sceneId: string) => Promise<void>;
  resetScene: () => Promise<void>;
  setSceneState: (key: string, value: any) => void;
  getSceneState: (key: string) => any;
}

export const SceneManagerContext =
  React.createContext<SceneManagerContextValue | null>(null);

export default function SceneManager({
  defaultScene,
  children,
}: SceneManagerProps) {
  const [currentScene, setCurrentScene] = useState(defaultScene);
  const sceneStore = useRef(new Map<string, any>());
  const { subscribe, unsubscribeAllHandlers } = useGame();

  const sceneManagerApi = useMemo<SceneManagerContextValue>(
    () => ({
      currentScene,
      async setScene(nextScene) {
        const targetScene = nextScene;
        console.log('Setting new scene ', currentScene, ' -- ', targetScene);
        if (currentScene !== targetScene) {
          if (currentScene !== '') {
            //TODO Trigger scene transistions via publishing
            //await publish<ScenePreExitEvent>('scene-pre-exit', currentScene);
            //await publish<SceneExitEvent>('scene-exit', currentScene);

            // Go to an empty scene first, then to the target scene
            console.log('Setting blank');
            setCurrentScene('');
            console.log('Waiting ...');
            wait(300);
          }
          console.log('Setting scene');
          setCurrentScene(targetScene);
        }
      },
      async resetScene() {
        const prevScene = currentScene;
        await sceneManagerApi.setScene('');
        await wait(100);
        setCurrentScene(prevScene);
      },
      setSceneState(key, value) {
        sceneStore.current.set(`${currentScene}.${key}`, value);
      },
      getSceneState(key) {
        return sceneStore.current.get(`${currentScene}.${key}`);
      },
    }),
    [currentScene]
  );
  console.log('[SceneManager] Rerendered Scene Manager');
  console.log('[SceneManager] CurrentScene is ', currentScene);

  useEffect(() => {
    subscribe<ChangeSceneEvent>(CHANGE_SCENE, ({ nextScene }) => {
      console.log('Changing scene to: ', nextScene);
      sceneManagerApi.setScene(nextScene);
    });
    return () => {
      unsubscribeAllHandlers(CHANGE_SCENE);
    };
  }, [sceneManagerApi, subscribe, unsubscribeAllHandlers]);

  return (
    <SceneManagerContext.Provider value={sceneManagerApi}>
      {children}
    </SceneManagerContext.Provider>
  );
}
