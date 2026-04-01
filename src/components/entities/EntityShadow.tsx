import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

const MAX_HEIGHT = 2;

// A simple flat plane that scales and moves based on its parent's height to create a shadow effect.
export const EntityShadow = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lastY = useRef<number | null>(null);

  useFrame(() => {
    const parent = meshRef.current?.parent as THREE.Group;
    if (!parent) return;
    const y = parent.position.y;
    if (lastY.current === y) return;
    lastY.current = y;

    const height = Math.max(0, y);
    meshRef.current!.position.y = -height + 0.01;
    const s = Math.max(0, 1 - height / MAX_HEIGHT);
    meshRef.current!.scale.set(s, 1, s);
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[0.5, 0.5]} />
      <meshBasicMaterial
        color="black"
        transparent
        opacity={0.25}
        depthWrite={false}
      />
    </mesh>
  );
};
