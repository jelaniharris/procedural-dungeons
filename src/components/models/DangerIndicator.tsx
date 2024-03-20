import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { DangerIndicator as DangerIndicatorType } from '../types/GameTypes';

type DangerIndicatorProps = JSX.IntrinsicElements['group'] & {
  indicatorType: DangerIndicatorType;
};

export default function DangerIndicator(props: DangerIndicatorProps) {
  const lspriteSheet = useLoader(
    THREE.TextureLoader,
    props.indicatorType === DangerIndicatorType.DAMAGE
      ? '/textures/DangerIcon.png'
      : '/textures/WarningIcon.png'
  );
  const material = new THREE.SpriteMaterial({
    map: lspriteSheet,
    transparent: true,
    side: THREE.FrontSide,
  });

  return (
    <group {...props} dispose={null}>
      <mesh rotation={[THREE.MathUtils.degToRad(270), 0, 0]}>
        <sprite material={material} />
      </mesh>
    </group>
  );
}
