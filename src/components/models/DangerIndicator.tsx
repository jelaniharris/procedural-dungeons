import * as THREE from 'three';
import React from 'react';
import { useLoader } from '@react-three/fiber';

export default function DangerIndicator(props: JSX.IntrinsicElements['group']) {
  const lspriteSheet = useLoader(
    THREE.TextureLoader,
    '/textures/DangerIcon.png'
  );
  const material = new THREE.SpriteMaterial({
    map: lspriteSheet,
    transparent: true,
    side: THREE.FrontSide,
  });

  return (
    <group {...props} dispose={null}>
      <mesh rotation={[THREE.MathUtils.degToRad(270), 0, 0]}>
        <sprite material={material} />
      </mesh>
    </group>
  );
}
