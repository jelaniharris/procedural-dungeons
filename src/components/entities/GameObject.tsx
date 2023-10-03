import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useLayoutEffect,
  useMemo,
} from 'react';
import { useRef, useState } from 'react';
import * as THREE from 'three';
import useGame from '../useGame';
import createPubSub, { PubSub } from '../../utils/pubSub';

export interface GameObjectProps {
  name?: string;
  displayName?: string;
  disabled?: boolean;
  position?: THREE.Vector3;
  children?: React.ReactNode;
}

export interface GameObjectContextValue extends PubSub {
  id: symbol;
  name: Readonly<string | undefined>;
  nodeRef: RefObject<THREE.Group>;
}

export type GameObjectRef = Pick<GameObjectProps, 'name'> & {
  id: symbol;
  disabled: Readonly<boolean>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
  subscribe: PubSub['subscribe'];
  publish: PubSub['publish'];
};

export const GameObjectContext =
  React.createContext<GameObjectContextValue | null>(null);

const GameObject = ({
  name,
  //displayName,
  children,
  position,
  disabled: initialDisabled = false,
}: GameObjectProps) => {
  const identifier = useRef(Symbol('GameObject'));
  const node = useRef(null);
  const [disabled, setDisabled] = useState(initialDisabled);
  const { registerGameObject, unregisterGameObject } = useGame();
  const [pubSub] = useState(() => createPubSub());

  const gameObjectRef = useMemo<GameObjectRef>(
    () => ({
      id: identifier.current,
      name,
      disabled,
      setDisabled,
      subscribe: pubSub.subscribe,
      publish: pubSub.publish,
    }),
    [disabled, name]
  );

  useLayoutEffect(() => {
    const id = identifier.current;
    registerGameObject(id, gameObjectRef);
    return () => unregisterGameObject(id);
  }, [registerGameObject, unregisterGameObject, gameObjectRef]);

  const contextValue: GameObjectContextValue = {
    id: identifier.current,
    name,
    ...pubSub,
    nodeRef: node,
  };

  return (
    <GameObjectContext.Provider value={contextValue}>
      <group ref={node} position={position}>
        {!disabled && children}
      </group>
    </GameObjectContext.Provider>
  );
};

export default GameObject;
