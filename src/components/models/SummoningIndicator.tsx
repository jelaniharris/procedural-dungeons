import { useFrame, useLoader } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import useGameObject from '../entities/useGameObject';
import useGameObjectEvent from '../entities/useGameObjectEvent';
import { OnTickEvent, TRIGGER_SUMMONING } from '../types/EventTypes';
import { SpawnWarning, SpawnWarningType } from '../types/GameTypes';
import useGame from '../useGame';

type SummoningIndicatorType = JSX.IntrinsicElements['group'] & {
  spawnWarning: SpawnWarning;
};

export default function SummoningIndicator(props: SummoningIndicatorType) {
  const myRef = useRef<THREE.Group>(null);
  const rows = 2;
  const cols = 2;
  const lspriteSheet = useLoader(
    THREE.TextureLoader,
    '/textures/SummoningCircles.png'
  );
  const spriteSheet = useMemo(() => lspriteSheet.clone(), [lspriteSheet]);
  spriteSheet.minFilter = THREE.LinearFilter;
  spriteSheet.repeat.x = 1 / cols;
  spriteSheet.repeat.y = 1 / rows;
  const currentPhase = useRef(props.spawnWarning.timer);

  const { publish } = useGame();
  const { getRef } = useGameObject();

  useGameObjectEvent<OnTickEvent>('on-tick', () => {
    if (currentPhase.current > 0) {
      currentPhase.current -= 1;
      if (currentPhase.current <= 0) {
        console.log('Trigger summoning for ', props.spawnWarning);
        publish(TRIGGER_SUMMONING, {
          spawnWarning: props.spawnWarning,
          gameObjectRef: getRef(),
        });
      }
    }
  });

  useFrame(() => {
    if (myRef && myRef.current && myRef.current.rotation) {
      myRef.current.rotation.y += Math.random() * 0.03;
    }
  });

  useEffect(() => {
    let col = 0;
    let row = 0;

    switch (props.spawnWarning.warningType) {
      case SpawnWarningType.WARNING_ENEMY:
        row = 0;
        col = 0;
        break;
      /*case PathCurves.PATH_DESTINATION:
        row = 1;
        col = 0;
        break;
      case PathCurves.PATH_CURVE:
        row = 0;
        col = 1;
        break;
      case PathCurves.PATH_STRAIGHT:
        row = 1;
        col = 1;
        break;*/
      default:
        [row, col] = [0, 0];
        break;
    }

    spriteSheet.offset.x = col / cols;
    spriteSheet.offset.y = 1 - (1 + row) / rows;
  }, [props.spawnWarning.warningType, spriteSheet.offset]);

  return (
    <group {...props} position={[0, 0.2, 0]} ref={myRef} dispose={null}>
      <mesh rotation={[THREE.MathUtils.degToRad(270), 0, 0]}>
        <planeGeometry attach="geometry" args={[1, 1]} />
        <meshBasicMaterial
          attach="material"
          side={THREE.FrontSide}
          map={spriteSheet}
          transparent
        />
      </mesh>
    </group>
  );
}
