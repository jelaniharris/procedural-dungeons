import { EntityShadow } from '@/components/entities/EntityShadow';
import { Enemy } from '@/components/types/GameTypes';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useEnemyMovement } from '@/hooks/useEnemyMovement';
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

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    SnakeBody: THREE.SkinnedMesh;
    Root: THREE.Bone;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

type ActionName = 'Idle' | 'Snake-Idle' | 'Static' | 'Walk';

interface NoodleProps {
  enemy: Enemy;
  enemyId: number;
  yOffset?: number;
}

export const Noodle = forwardRef(function Noodle(
  props: JSX.IntrinsicElements['group'] & NoodleProps,
  forwardedRef
) {
  const position = useMemo(() => props.position, []);
  const MovementSpeed = 0.32;

  const Noodle = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => Noodle.current);

  const { nodes, materials, animations } = useGLTF(
    '/models/characters/Noodle.glb'
  ) as GLTFResult;
  const { actions } = useAnimations(animations, Noodle);
  const [animation, setAnimation] = useState<ActionName>('Idle');

  useEffect(() => {
    if (!actions) {
      return () => {};
    } else {
      actions[animation]?.reset().fadeIn(0.32).play();
      return () => actions[animation]?.fadeOut(0.32);
    }
  }, [actions, animation]);

  useEnemyMovement(
    Noodle,
    props.position as THREE.Vector3,
    props.yOffset ?? 0,
    props.enemy.movementPoints,
    setAnimation,
    'Walk',
    'Idle',
    MovementSpeed
  );

  return (
    <group ref={Noodle} {...props} position={position} dispose={null}>
      <EntityShadow />
      <group name="Snake">
        <group name="Armature" scale={0.225}>
          <primitive object={nodes.Root} />
        </group>
        <skinnedMesh
          name="SnakeBody"
          geometry={nodes.SnakeBody.geometry}
          material={materials.colormap}
          skeleton={nodes.SnakeBody.skeleton}
        />
      </group>
    </group>
  );
});

useGLTF.preload('/models/characters/Noodle.glb');
