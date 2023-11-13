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

interface OrcProps {
  enemy: Enemy;
  enemyId: number;
}

export const Orc = forwardRef(function Orc(
  props: JSX.IntrinsicElements['group'] & OrcProps,
  forwardedRef
) {
  const position = useMemo(() => props.position, []);
  const MovementSpeed = 0.32;

  const orc = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => orc.current);

  const { nodes, materials, animations } = useGLTF(
    '/models/characters/orc/character-orc.glb'
  ) as GLTFResult;
  const { actions } = useAnimations(animations, orc);
  const [animation, setAnimation] = useState<ActionName>('idle');

  useEffect(() => {
    if (!actions) {
      return () => {};
    } else {
      actions[animation]?.reset().fadeIn(0.32).play();
      return () => actions[animation]?.fadeOut(0.32);
    }
  }, [actions, animation]);

  useFrame(() => {
    if (!orc || !orc.current || !props.position) {
      return;
    }
    const propsPosition = props.position as THREE.Vector3;
    if (orc.current?.position.distanceTo(propsPosition) > 0.2) {
      const direction = orc.current.position
        .clone()
        .sub(propsPosition)
        .normalize()
        .multiplyScalar(MovementSpeed);
      //orc.current?.position.lerp(props.position as THREE.Vector3, 0.2);
      orc.current.position.sub(direction);
      orc.current.lookAt(propsPosition);
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
    <group ref={orc} {...props} position={position} dispose={null}>
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
