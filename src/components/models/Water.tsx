/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.10 ./public/models/environment/floor.glb -t 
*/

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    floor: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

export default function Water(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/models/environment/water.glb'
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.floor.geometry} material={materials.colormap} />
    </group>
  );
}

useGLTF.preload('/models/environment/water.glb');