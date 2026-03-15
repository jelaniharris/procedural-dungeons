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

interface GLTFAction extends THREE.AnimationClip {
  name: ActionName;
}

type GLTFResult = GLTF & {
  nodes: {
    ['leg-left']: THREE.Mesh;
    ['leg-right']: THREE.Mesh;
    torso: THREE.Mesh;
    ['arm-left']: THREE.Mesh;
    ['arm-right']: THREE.Mesh;
    head: THREE.Mesh;
  };
  materials: {
    colormap: THREE.MeshStandardMaterial;
  };
  animations: GLTFAction[];
};

type ActionName =
  | 'static'
  | 'idle'
  | 'walk'
  | 'sprint'
  | 'jump'
  | 'fall'
  | 'die';

interface JumperProps {
  enemy: Enemy;
  enemyId: number;
}

const JUMP_ARC_HEIGHT = 1.5;
// Progress added per frame — at 60fps, 0.04 ≈ 25 frames ≈ 416ms per jump
const JUMP_SPEED = 0.04;

export const Jumper = forwardRef(function Jumper(
  props: JSX.IntrinsicElements['group'] & JumperProps,
  forwardedRef
) {
  const initialPosition = useMemo(() => props.position, []);

  const jumperRef = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => jumperRef.current);

  const { nodes, materials, animations } = useGLTF(
    '/models/characters/orc/character-orc.glb'
  ) as GLTFResult;
  const { actions } = useAnimations(animations, jumperRef);
  const [animation, setAnimation] = useState<ActionName>('idle');

  // Jump arc state
  const arcStart = useRef<THREE.Vector3 | null>(null);
  const arcEnd = useRef<THREE.Vector3 | null>(null);
  const arcProgress = useRef(1); // 1 = idle / done

  useEffect(() => {
    if (!actions) return () => {};
    actions[animation]?.reset().fadeIn(0.2).play();
    return () => actions[animation]?.fadeOut(0.2);
  }, [actions, animation]);

  useFrame(() => {
    if (!jumperRef.current || !props.position) return;

    const target = props.position as THREE.Vector3;

    // Detect when state-driven position changes and we're not mid-jump
    if (arcProgress.current >= 1) {
      const distToTarget = jumperRef.current.position.distanceTo(target);
      if (distToTarget > 0.5) {
        // Start a new arc jump
        arcStart.current = jumperRef.current.position.clone();
        arcEnd.current = target.clone();
        arcProgress.current = 0;
        setAnimation('jump');
      } else {
        setAnimation(props.enemy.movementPoints.length > 0 ? 'jump' : 'idle');
      }
      return;
    }

    // Advance the jump arc
    if (arcStart.current && arcEnd.current) {
      arcProgress.current = Math.min(arcProgress.current + JUMP_SPEED, 1);
      const t = arcProgress.current;

      jumperRef.current.position.x = THREE.MathUtils.lerp(
        arcStart.current.x,
        arcEnd.current.x,
        t
      );
      jumperRef.current.position.z = THREE.MathUtils.lerp(
        arcStart.current.z,
        arcEnd.current.z,
        t
      );
      // Parabolic arc: sin(t * π) peaks at t=0.5
      jumperRef.current.position.y = JUMP_ARC_HEIGHT * Math.sin(t * Math.PI);

      // Face the landing tile throughout the jump
      jumperRef.current.lookAt(
        new THREE.Vector3(arcEnd.current.x, 0, arcEnd.current.z)
      );

      if (t >= 1) {
        jumperRef.current.position.y = 0;
        setAnimation('idle');
      }
    }
  });

  return (
    <group ref={jumperRef} {...props} position={initialPosition} dispose={null}>
      <group name="character-orc">
        <group name="character-orc_1">
          <group name="root">
            <mesh
              name="leg-left"
              geometry={nodes['leg-left'].geometry}
              material={materials.colormap}
              position={[0.084, 0.176, -0.024]}
            />
            <mesh
              name="leg-right"
              geometry={nodes['leg-right'].geometry}
              material={materials.colormap}
              position={[-0.084, 0.176, -0.024]}
            />
            <mesh
              name="torso"
              geometry={nodes.torso.geometry}
              material={materials.colormap}
              position={[0, 0.176, -0.024]}
            >
              <mesh
                name="arm-left"
                geometry={nodes['arm-left'].geometry}
                material={materials.colormap}
                position={[0.1, 0.112, 0.011]}
              />
              <mesh
                name="arm-right"
                geometry={nodes['arm-right'].geometry}
                material={materials.colormap}
                position={[-0.1, 0.112, 0.011]}
              />
              <mesh
                name="head"
                geometry={nodes.head.geometry}
                material={materials.colormap}
                position={[0, 0.167, 0.026]}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
});

useGLTF.preload('/models/characters/orc/character-orc.glb');
