/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.2.14 .\public\models\characters\character-ghost.glb -t 
*/

import { Enemy } from '@/components/types/GameTypes';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

type ActionName =
  | 'static'
  | 'idle'
  | 'walk'
  | 'sprint'
  | 'jump'
  | 'fall'
  | 'crouch'
  | 'sit'
  | 'drive'
  | 'die'
  | 'pick-up'
  | 'emote-yes'
  | 'emote-no'
  | 'holding-right'
  | 'holding-left'
  | 'holding-both'
  | 'holding-right-shoot'
  | 'holding-left-shoot'
  | 'holding-both-shoot'
  | 'attack-melee-right'
  | 'attack-melee-left'
  | 'attack-kick-right'
  | 'attack-kick-left'
  | 'interact-right'
  | 'interact-left';
interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    torso: THREE.Mesh;
    ['arm-left']: THREE.Mesh;
    ['arm-right']: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

interface GhostProps {
  enemy: Enemy;
  enemyId: number;
}

export const Ghost = forwardRef(function GhostFunction(
  props: JSX.IntrinsicElements['group'] & GhostProps,
  forwardedRef
) {
  const position = useMemo(() => props.position, []);

  const ghost = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => ghost.current);

  const { nodes, materials, animations } = useGLTF(
    '/models/characters/character-ghost.glb'
  ) as GLTFResult;

  const { actions } = useAnimations(animations, ghost);
  const [animation, setAnimation] = useState<ActionName>('idle');

  const MovementSpeed = 0.32;

  useEffect(() => {
    if (!actions) {
      return () => {};
    } else {
      actions[animation]?.reset().fadeIn(0.32).play();
      return () => actions[animation]?.fadeOut(0.32);
    }
  }, [actions, animation]);

  useFrame(() => {
    if (!ghost || !ghost.current || !props.position) {
      return;
    }
    const propsPosition = props.position as THREE.Vector3;
    if (ghost.current?.position.distanceTo(propsPosition) > 0.2) {
      const direction = ghost.current.position
        .clone()
        .sub(propsPosition)
        .normalize()
        .multiplyScalar(MovementSpeed);
      //orc.current?.position.lerp(props.position as THREE.Vector3, 0.2);
      ghost.current.position.sub(direction);
      ghost.current.lookAt(propsPosition);
      setAnimation('walk');
    } else {
      if (props.enemy.movementPoints.length > 0) {
        setAnimation('walk');
      } else {
        setAnimation('idle');
      }
    }
  });

  return (
    <group ref={ghost} {...props} position={position} dispose={null}>
      <group name="character-ghost">
        <group name="character-ghost_1">
          <group name="root">
            <mesh
              name="torso"
              geometry={nodes.torso.geometry}
              material={materials.colormap}
              position={[0, 0.223, 0]}
            >
              <mesh
                name="arm-left"
                geometry={nodes['arm-left'].geometry}
                material={materials.colormap}
                position={[0.15, 0.225, 0.003]}
              />
              <mesh
                name="arm-right"
                geometry={nodes['arm-right'].geometry}
                material={materials.colormap}
                position={[-0.15, 0.225, 0.003]}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
});

useGLTF.preload('/models/characters/character-ghost.glb');
