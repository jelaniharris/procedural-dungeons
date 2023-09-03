/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.10 ./public/models/environment/stairs.glb -t 
*/

import * as THREE from 'three';
import React from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    stairs: THREE.Mesh;
  };
  materials: {
    grey: THREE.MeshStandardMaterial;
  };
};

export function Stairs(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/models/environment/stairs.glb'
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.stairs.geometry} material={materials.grey} />
    </group>
  );
}

useGLTF.preload('/models/environment/stairs.glb');
