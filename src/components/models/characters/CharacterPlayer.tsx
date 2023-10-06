/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.10 ./public/character-human.glb -t 
*/

import * as THREE from 'three';
import React, { useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

type GLTFResult = GLTF & {
  nodes: {
    mesh_0: THREE.Mesh;
    mesh_0_1: THREE.Mesh;
    ['Mesh_arm-left_Instance']: THREE.Mesh;
    ['Mesh_arm-left_Instance_1']: THREE.Mesh;
    ['Mesh_arm-right_Instance']: THREE.Mesh;
    ['Mesh_arm-right_Instance_1']: THREE.Mesh;
    ['leg-left']: THREE.Mesh;
    ['leg-right']: THREE.Mesh;
    mesh_5: THREE.Mesh;
    mesh_5_1: THREE.Mesh;
    mesh_5_2: THREE.Mesh;
    mesh_5_3: THREE.Mesh;
  };
  materials: {
    grey: THREE.MeshStandardMaterial;
    brown: THREE.MeshStandardMaterial;
    beige: THREE.MeshStandardMaterial;
    dark: THREE.MeshStandardMaterial;
    ['default']: THREE.MeshStandardMaterial;
  };
};

export function CharacterPlayer(props: JSX.IntrinsicElements['group']) {
  const human = useRef<Group>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const position = useMemo(() => props.position, []);

  useFrame(() => {
    if (!human || !human.current) {
      return;
    }
    if (
      props.position &&
      human.current?.position.distanceTo(props.position as THREE.Vector3) > 0.1
    ) {
      human.current?.position.lerp(props.position as THREE.Vector3, 0.1);
    }
  });

  const { nodes, materials } = useGLTF('/character-human.glb') as GLTFResult;

  return (
    <group {...props} position={position} dispose={null} ref={human}>
      <group position={[0, 0.176, 0]}>
        <mesh geometry={nodes.mesh_0.geometry} material={materials.grey} />
        <mesh geometry={nodes.mesh_0_1.geometry} material={materials.brown} />
        <group position={[-0.1, 0.112, -0.011]}>
          <mesh
            geometry={nodes['Mesh_arm-left_Instance'].geometry}
            material={materials.brown}
          />
          <mesh
            geometry={nodes['Mesh_arm-left_Instance_1'].geometry}
            material={materials.grey}
          />
        </group>
        <group position={[0.1, 0.112, -0.011]}>
          <mesh
            geometry={nodes['Mesh_arm-right_Instance'].geometry}
            material={materials.brown}
          />
          <mesh
            geometry={nodes['Mesh_arm-right_Instance_1'].geometry}
            material={materials.grey}
          />
        </group>
        <mesh
          geometry={nodes['leg-left'].geometry}
          material={materials.brown}
          position={[-0.084, 0, 0]}
        />
        <mesh
          geometry={nodes['leg-right'].geometry}
          material={materials.brown}
          position={[0.084, 0, 0]}
        />
        <group position={[0, 0.167, -0.026]}>
          <mesh geometry={nodes.mesh_5.geometry} material={materials.brown} />
          <mesh geometry={nodes.mesh_5_1.geometry} material={materials.beige} />
          <mesh geometry={nodes.mesh_5_2.geometry} material={materials.dark} />
          <mesh
            geometry={nodes.mesh_5_3.geometry}
            material={materials['default']}
          />
        </group>
      </group>
    </group>
  );
}

useGLTF.preload('/character-human.glb');