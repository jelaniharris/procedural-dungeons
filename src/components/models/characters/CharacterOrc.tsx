import * as THREE from 'three';
import React, { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';
import { Enemy } from '@/components/types/GameTypes';
import { useFrame } from '@react-three/fiber';

type GLTFResult = GLTF & {
  nodes: {
    mesh_0: THREE.Mesh;
    mesh_0_1: THREE.Mesh;
    ['Mesh_arm-left_Instance']: THREE.Mesh;
    ['Mesh_arm-left_Instance_1']: THREE.Mesh;
    ['Mesh_arm-right_Instance']: THREE.Mesh;
    ['Mesh_arm-right_Instance_1']: THREE.Mesh;
    ['Mesh_leg-left_(%reverse)_Instance']: THREE.Mesh;
    ['Mesh_leg-left_(%reverse)_Instance_1']: THREE.Mesh;
    ['Mesh_leg-right_(%reverse)_Instance']: THREE.Mesh;
    ['Mesh_leg-right_(%reverse)_Instance_1']: THREE.Mesh;
    mesh_5: THREE.Mesh;
    mesh_5_1: THREE.Mesh;
    mesh_5_2: THREE.Mesh;
    mesh_5_3: THREE.Mesh;
  };
  materials: {
    brown: THREE.MeshStandardMaterial;
    dark: THREE.MeshStandardMaterial;
    green: THREE.MeshStandardMaterial;
    yellow: THREE.MeshStandardMaterial;
    ['default']: THREE.MeshStandardMaterial;
  };
};

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

  //const orc = useRef<THREE.Group>(null);
  const orc = useRef<THREE.Group>(null);
  useImperativeHandle(forwardedRef, () => orc.current);

  //const enemies = useStore((store: GameState) => store.enemies, shallow);

  //const enemy = props.enemy; //enemies[props.enemyId];
  //console.log('Rendering enemy:', enemy);

  const { nodes, materials } = useGLTF(
    '/models/characters/character-orc.glb'
  ) as GLTFResult;

  /*
  const { actions } = useAnimations(animations,group);
  const [animation, setAnimation] = useState("idle");

  useEffect(() => {
    actions[animation].reset().fadeIn(0.32).play();
    return () => actions[animation]?.fadeOut(0.32);
  })
  */

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
      //setAnimation("walk")
    } else {
      // setAnimation("idle")
    }
  });

  return (
    <group {...props} position={position} ref={orc} dispose={null}>
      <group position={[0, 0.176, 0]}>
        <mesh geometry={nodes.mesh_0.geometry} material={materials.brown} />
        <mesh geometry={nodes.mesh_0_1.geometry} material={materials.dark} />
        <group position={[-0.1, 0.112, -0.011]}>
          <mesh
            geometry={nodes['Mesh_arm-left_Instance'].geometry}
            material={materials.brown}
          />
          <mesh
            geometry={nodes['Mesh_arm-left_Instance_1'].geometry}
            material={materials.green}
          />
        </group>
        <group position={[0.1, 0.112, -0.011]}>
          <mesh
            geometry={nodes['Mesh_arm-right_Instance'].geometry}
            material={materials.brown}
          />
          <mesh
            geometry={nodes['Mesh_arm-right_Instance_1'].geometry}
            material={materials.green}
          />
        </group>
        <group position={[-0.084, 0, 0]}>
          <mesh
            geometry={nodes['Mesh_leg-left_(%reverse)_Instance'].geometry}
            material={materials.dark}
          />
          <mesh
            geometry={nodes['Mesh_leg-left_(%reverse)_Instance_1'].geometry}
            material={materials.brown}
          />
        </group>
        <group position={[0.084, 0, 0]}>
          <mesh
            geometry={nodes['Mesh_leg-right_(%reverse)_Instance'].geometry}
            material={materials.brown}
          />
          <mesh
            geometry={nodes['Mesh_leg-right_(%reverse)_Instance_1'].geometry}
            material={materials.dark}
          />
        </group>
        <group position={[0, 0.167, -0.026]}>
          <mesh geometry={nodes.mesh_5.geometry} material={materials.dark} />
          <mesh geometry={nodes.mesh_5_1.geometry} material={materials.green} />
          <mesh
            geometry={nodes.mesh_5_2.geometry}
            material={materials.yellow}
          />
          <mesh
            geometry={nodes.mesh_5_3.geometry}
            material={materials['default']}
          />
        </group>
      </group>
    </group>
  );
});

useGLTF.preload('/models/characters/character-orc.glb');
