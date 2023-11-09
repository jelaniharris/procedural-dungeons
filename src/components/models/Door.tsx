/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\environment\Door.glb -t 
*/

import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type GLTFResult = GLTF & {
  nodes: {
    DoorFrame: THREE.Mesh;
    WoodenDoor: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

//type ContextType = Record<string, React.ForwardRefExoticComponent<JSX.IntrinsicElements['mesh']>>

export default function Door(props: JSX.IntrinsicElements['group']) {
  const { nodes, materials } = useGLTF(
    '/models/environment/Door.glb'
  ) as GLTFResult;
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.DoorFrame.geometry} material={materials.colormap} />
      <mesh
        geometry={nodes.WoodenDoor.geometry}
        material={materials.colormap}
      />
    </group>
  );
}

useGLTF.preload('/models/environment/Door.glb');
