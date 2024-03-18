/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\traps\Gas.glb -t 
*/

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { Color, DoubleSide, MeshStandardMaterial, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';
import { Enemy, Gases } from '../types/GameTypes';

type GLTFResult = GLTF & {
  nodes: {
    HoriPlane: THREE.Mesh;
    VertPlaneY: THREE.Mesh;
    VertPlaneZ: THREE.Mesh;
  };
  materials: {
    Smoke: THREE.MeshStandardMaterial;
  };
};
interface GasProps {
  gasType: Gases;
  position: Vector3;
  enemy: Enemy;
  enemyId: number;
}

export const Gas = forwardRef(function Gas(
  props: JSX.IntrinsicElements['group'] & GasProps,
  forwardedRef
) {
  const { nodes, materials } = useGLTF(
    '/models/characters/Gas.glb'
  ) as GLTFResult;
  const myRef = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => myRef.current);
  const rotationalSpeed = 0.002;

  const newPosition = useMemo(() => {
    if (props.position) {
      const newPos = props.position;
      newPos.y = newPos.y + 0.5;
      return newPos;
    }
    return;
  }, [props.position]);

  const smokeMaterial = useMemo(() => {
    const material = new MeshStandardMaterial().copy(materials.Smoke);
    //material.map = smokeTexture;
    material.side = DoubleSide;
    material.metalness = 0;
    material.roughness = 1;

    material.emissiveIntensity = 0.5;
    material.flatShading = true;

    switch (props.gasType) {
      case Gases.GAS_POISON:
        material.color = new Color(0x00ff00);
        material.emissive = new Color(0x00ff00);
        break;
      case Gases.GAS_CONFUSION:
        material.color = new Color(0xcccc00);
        material.emissive = new Color(0xcccc00);
        break;
    }
    return material;
  }, [materials.Smoke, props.gasType]);

  useFrame(() => {
    if (myRef && myRef.current && myRef.current.rotation) {
      myRef.current.rotation.y += rotationalSpeed;
      myRef.current.rotation.x += rotationalSpeed;
      myRef.current.rotation.z += rotationalSpeed;
    }
  });

  return (
    <group
      {...props}
      position={newPosition}
      scale={1.5}
      dispose={null}
      ref={myRef}
    >
      <mesh geometry={nodes.HoriPlane.geometry} material={smokeMaterial} />
      <mesh geometry={nodes.VertPlaneY.geometry} material={smokeMaterial} />
      <mesh geometry={nodes.VertPlaneZ.geometry} material={smokeMaterial} />
    </group>
  );
});

useGLTF.preload('/models/characters/Gas.glb');
