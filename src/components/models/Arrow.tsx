/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\projectiles\Arrow.glb -t 
*/

import { useGLTF } from '@react-three/drei';
import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { MoveableObjectRef, MovedEvent } from '../entities/MoveableObject';
import useGameObject from '../entities/useGameObject';
import useGameObjectEvent from '../entities/useGameObjectEvent';
import { Projectile } from '../types/GameTypes';

type GLTFResult = GLTF & {
  nodes: {
    Arrowfeathers: THREE.Mesh;
    Arrowhead: THREE.Mesh;
    Arrowshaft: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
};

interface ArrowProps {
  data: Projectile;
}

export function Arrow(props: JSX.IntrinsicElements['group'] & ArrowProps) {
  const { nodes, materials } = useGLTF(
    '/models/projectiles/Arrow.glb'
  ) as GLTFResult;

  const { getComponent } = useGameObject();

  useGameObjectEvent<MovedEvent>('moved', () => {
    if (props.data.beforeDestroy) {
      props.data.beforeDestroy();
    }
    if (props.data.destroy) {
      props.data.destroy(props.data.id);
    }
  });

  useEffect(() => {
    const moveMe = async () => {
      const movementRef = getComponent<MoveableObjectRef>('Moveable');
      if (props.data.destLocation && movementRef && !movementRef.isMoving()) {
        await movementRef.move(props.data.destLocation, 'move');
      }
    };
    moveMe();
  }, [getComponent, props.data.destLocation]);

  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Arrowfeathers.geometry}
        material={nodes.Arrowfeathers.material}
        position={[0, 0.27, 0.182]}
      />
      <mesh
        geometry={nodes.Arrowhead.geometry}
        material={materials.colormap}
        position={[0, 0.271, 0]}
      />
      <mesh
        geometry={nodes.Arrowshaft.geometry}
        material={materials.colormap}
        position={[0, 0.271, 0]}
      />
    </group>
  );
}

useGLTF.preload('/models/projectiles/Arrow.glb');
