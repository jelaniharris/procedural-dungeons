import { useRef, useState } from 'react';
import * as THREE from 'three';

interface GameObjectProps {
  name?: string;
  disabled?: boolean;
  position?: THREE.Vector3;
  children?: React.ReactNode;
}

const GameObject = ({
  //name,
  children,
  position,
  disabled: initialDisabled = false,
}: GameObjectProps) => {
  const node = useRef(null);
  const [disabled /*, setDisabled*/] = useState(initialDisabled);

  return (
    <group ref={node} position={position}>
      {!disabled && children}
    </group>
  );
};

export default GameObject;
