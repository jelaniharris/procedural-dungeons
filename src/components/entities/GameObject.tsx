import { Point2D } from '@/utils/Point2D';
import { Euler } from '@react-three/fiber';
import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import createPubSub, { PubSub } from '../../utils/pubSub';
import useGame from '../useGame';
import { ComponentRegistryUtils } from './useComponentRegistry';

export interface GameObjectProps {
  name?: string;
  displayName?: string;
  disabled?: boolean;
  transform: Point2D;
  rotation?: Euler;
  children?: React.ReactNode;
  zOffset?: number;
}

export interface GameObjectContextValue extends ComponentRegistryUtils, PubSub {
  id: symbol;
  name: Readonly<string | undefined>;
  nodeRef: RefObject<THREE.Group>;
  transform: Point2D;
  zOffset?: number;
  getRef: () => GameObjectRef;
}

export type GameObjectRef = Pick<GameObjectProps, 'name'> & {
  id: symbol;
  disabled: Readonly<boolean>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  subscribe: PubSub['subscribe'];
  publish: PubSub['publish'];
  transform: GameObjectContextValue['transform'];
  getComponent: ComponentRegistryUtils['getComponent'];
};

export const GameObjectContext =
  React.createContext<GameObjectContextValue | null>(null);

const GameObject = ({
  name,
  //displayName,
  children,
  transform,
  rotation,
  zOffset,
  disabled: initialDisabled = false,
}: GameObjectProps) => {
  const identifier = useRef(Symbol('GameObject'));
  const node = useRef(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [registry] = useState(() => new Map<string, any>());

  const [disabled, setDisabled] = useState(initialDisabled);
  const { registerGameObject, unregisterGameObject } = useGame();
  const [pubSub] = useState(() => createPubSub());

  // Register component utils
  const registryUtils = useMemo<ComponentRegistryUtils>(
    () => ({
      registerComponent(name, api) {
        registry.set(name, api);
      },
      unregisterComponent(name) {
        registry.delete(name);
      },
      getComponent(name) {
        return registry.get(name);
      },
    }),
    [registry]
  );

  const gameObjectRef = useMemo<GameObjectRef>(
    () => ({
      id: identifier.current,
      name,
      disabled,
      setDisabled,
      subscribe: pubSub.subscribe,
      publish: pubSub.publish,
      transform,
      getComponent: registryUtils.getComponent,
    }),
    [disabled, name, transform, pubSub, registryUtils]
  );

  const getRef = useCallback(() => gameObjectRef, [gameObjectRef]);

  useLayoutEffect(() => {
    const id = identifier.current;
    registerGameObject(id, gameObjectRef);
    return () => unregisterGameObject(id, gameObjectRef);
  }, [registerGameObject, unregisterGameObject, gameObjectRef]);

  const contextValue: GameObjectContextValue = {
    id: identifier.current,
    name,
    ...pubSub,
    nodeRef: node,
    getRef,
    transform,
    zOffset,
    ...registryUtils,
  };

  return (
    <GameObjectContext.Provider value={contextValue}>
      <group
        ref={node}
        position={[transform.x, zOffset ? zOffset : 0, transform.y]}
        rotation={rotation}
      >
        {!disabled && children}
      </group>
    </GameObjectContext.Provider>
  );
};

export default GameObject;
