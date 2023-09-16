/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.10 ./public/dirt.glb -t 
*/

import * as THREE from 'three';
import React from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    dirt_1: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

export default function Dirt(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/models/environment/dirt.glb'
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.dirt_1.geometry} material={materials.colormap} />
    </group>
  );
}

useGLTF.preload('/models/environment/dirt.glb');
