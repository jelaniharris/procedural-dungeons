import { EntityShadow } from '@/components/entities/EntityShadow';
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
import { GLTF, SkeletonUtils } from 'three-stdlib';

type ActionName =
  | 'Slime_Idle'
  | 'Slime_JumpStart'
  | 'Slime_JumpLoop'
  | 'Slime_JumpEnd';

interface CharacterSlimeProps {
  enemy: Enemy;
  enemyId: number;
  yOffset?: number;
}

const JUMP_ARC_HEIGHT = 1;
// Progress added per frame — at 60fps, 0.04 ≈ 25 frames ≈ 416ms per jump
const JUMP_SPEED = 0.04;

export const CharacterSlime = forwardRef(function CharacterSlime(
  props: JSX.IntrinsicElements['group'] & CharacterSlimeProps,
  forwardedRef
) {
  const initialPosition = useMemo(() => props.position, []);

  const slimeRef = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => slimeRef.current);

  const { scene, animations } = useGLTF(
    '/models/characters/Slime.glb'
  ) as GLTF & { scene: THREE.Group };
  // Clone the scene per-instance so each slime has its own bone hierarchy
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions } = useAnimations(animations, slimeRef);
  const [animation, setAnimation] = useState<ActionName>('Slime_Idle');

  // Jump arc state
  const arcStart = useRef<THREE.Vector3 | null>(null);
  const arcEnd = useRef<THREE.Vector3 | null>(null);
  const arcProgress = useRef(1); // 1 = idle / done
  const currentAnimPhase = useRef<ActionName>('Slime_Idle');

  useEffect(() => {
    if (!actions) return () => {};
    actions[animation]?.reset().fadeIn(0.2).play();
    return () => actions[animation]?.fadeOut(0.2);
  }, [actions, animation]);

  useFrame(() => {
    if (!slimeRef.current || !props.position) return;

    const target = props.position as THREE.Vector3;

    // Detect when state-driven position changes and we're not mid-jump
    if (arcProgress.current >= 1) {
      const distToTarget = slimeRef.current.position.distanceTo(target);
      if (distToTarget > 0.5) {
        // Start a new arc jump
        arcStart.current = slimeRef.current.position.clone();
        arcEnd.current = target.clone();
        arcProgress.current = 0;
        currentAnimPhase.current = 'Slime_JumpStart';
        setAnimation('Slime_JumpStart');
      } else {
        if (currentAnimPhase.current !== 'Slime_Idle') {
          currentAnimPhase.current = 'Slime_Idle';
          setAnimation('Slime_Idle');
        }
        slimeRef.current.position.y = THREE.MathUtils.lerp(
          slimeRef.current.position.y,
          props.yOffset ?? 0,
          0.15
        );
      }
      return;
    }

    // Advance the jump arc
    if (arcStart.current && arcEnd.current) {
      arcProgress.current = Math.min(arcProgress.current + JUMP_SPEED, 1);
      const t = arcProgress.current;

      slimeRef.current.position.x = THREE.MathUtils.lerp(
        arcStart.current.x,
        arcEnd.current.x,
        t
      );
      slimeRef.current.position.z = THREE.MathUtils.lerp(
        arcStart.current.z,
        arcEnd.current.z,
        t
      );
      // Parabolic arc: sin(t * π) peaks at t=0.5
      slimeRef.current.position.y = JUMP_ARC_HEIGHT * Math.sin(t * Math.PI);

      // Face the landing tile (Y-axis only — lookAt would pitch the model into the ground)
      slimeRef.current.rotation.x = 0;
      slimeRef.current.rotation.z = 0;
      slimeRef.current.rotation.y = Math.atan2(
        arcEnd.current.x - arcStart.current.x,
        arcEnd.current.z - arcStart.current.z
      );

      // Phase animation through JumpStart → JumpLoop → JumpEnd
      if (t >= 0.75 && currentAnimPhase.current !== 'Slime_JumpEnd') {
        currentAnimPhase.current = 'Slime_JumpEnd';
        setAnimation('Slime_JumpEnd');
      } else if (
        t >= 0.3 &&
        t < 0.75 &&
        currentAnimPhase.current !== 'Slime_JumpLoop'
      ) {
        currentAnimPhase.current = 'Slime_JumpLoop';
        setAnimation('Slime_JumpLoop');
      }

      if (t >= 1) {
        slimeRef.current.position.y = props.yOffset ?? 0;
        currentAnimPhase.current = 'Slime_Idle';
        setAnimation('Slime_Idle');
      }
    }
  });

  return (
    <group ref={slimeRef} {...props} position={initialPosition} dispose={null}>
      <EntityShadow />
      <primitive object={clonedScene} />
    </group>
  );
});

useGLTF.preload('/models/characters/Slime.glb');
