/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.13 .\public\models\environment\LShape-Wall.glb -t 
*/

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    ['wall-lshape']: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

export function LShapeWall(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/models/environment/LShape-Wall.glb'
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes['wall-lshape'].geometry}
        material={materials.colormap}
      />
    </group>
  );
}

useGLTF.preload('/models/environment/LShape-Wall.glb');