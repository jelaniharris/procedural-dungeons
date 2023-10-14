import { useContext } from 'react';
import { SceneManagerContext, SceneManagerContextValue } from './SceneManager';

export default function useSceneManager() {
  return useContext(SceneManagerContext) as SceneManagerContextValue;
}
