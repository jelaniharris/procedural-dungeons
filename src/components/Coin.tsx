/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.10 ./public/coin.glb -t 
*/

import * as THREE from 'three';
import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    coin: THREE.Mesh;
  };
  materials: {
    yellow: THREE.MeshStandardMaterial;
  };
};

export function Coin(props: JSX.IntrinsicElements['group']) {
  const coinRef = useRef();
  const { nodes, materials } = useGLTF('/coin.glb') as GLTFResult;

  useFrame(() => {
    if (coinRef.current) {
      coinRef.current.rotation.y += 0.03;
    }
  });

  return (
    <group {...props} ref={coinRef} dispose={null}>
      <mesh geometry={nodes.coin.geometry} material={materials.yellow} />
    </group>
  );
}

useGLTF.preload('/coin.glb');
