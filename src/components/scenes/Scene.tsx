import React, { useContext, useMemo } from 'react';
import useSceneManager from './useSceneManager';

interface SceneProps {
  id: string;
  children: React.ReactNode;
}

interface SceneContextValue {
  currentScene: string;
  resetScene: () => void;
}

const SceneContext = React.createContext<SceneContextValue | null>(null);

export function useScene() {
  return useContext(SceneContext) as SceneContextValue;
}

export default function Scene({ id, children }: SceneProps) {
  const { currentScene, resetScene } = useSceneManager();

  const contextValue = useMemo<SceneContextValue>(
    () => ({ currentScene, resetScene }),
    [currentScene, resetScene]
  );

  console.log('Current scene is: ', currentScene, 'id: ', id);

  if (!currentScene.startsWith(id)) return null;

  return (
    <SceneContext.Provider value={contextValue}>
      <group>{children}</group>
    </SceneContext.Provider>
  );
}
