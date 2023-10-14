/* eslint-disable @typescript-eslint/no-explicit-any */
import wait from '@/utils/wait';
import React, { useMemo, useRef, useState } from 'react';

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
  const [currentScene, setScene] = useState(defaultScene);
  const sceneStore = useRef(new Map<string, any>());

  const sceneManagerApi = useMemo<SceneManagerContextValue>(
    () => ({
      currentScene,
      async setScene(nextScene) {
        const targetScene = nextScene;
        if (currentScene !== targetScene) {
          if (currentScene !== '') {
            //TODO Trigger scene transistions via publishing
            // scene-pre-exit, scene-exit

            // Go to an empty scene first, then to the target scene
            setScene('');
            wait(300);
          }
          setScene(targetScene);
        }
      },
      async resetScene() {
        const prevScene = currentScene;
        await sceneManagerApi.setScene('');
        await wait(100);
        setScene(prevScene);
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

  return (
    <SceneManagerContext.Provider value={sceneManagerApi}>
      {children}
    </SceneManagerContext.Provider>
  );
}
