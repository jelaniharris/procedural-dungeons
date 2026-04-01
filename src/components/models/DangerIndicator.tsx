import { useLoader } from '@react-three/fiber';
import { useEffect, useMemo } from 'react';
import { SpriteMaterial, TextureLoader } from 'three';
import { DangerIndicator as DangerIndicatorType } from '../types/GameTypes';

type DangerIndicatorProps = JSX.IntrinsicElements['group'] & {
  indicatorType: DangerIndicatorType;
};

export default function DangerIndicator(props: DangerIndicatorProps) {
  const lspriteSheet = useLoader(
    TextureLoader,
    props.indicatorType === DangerIndicatorType.DAMAGE
      ? '/textures/DangerIcon.png'
      : '/textures/WarningIcon.png'
  );
  const material = useMemo(
    () =>
      new SpriteMaterial({
        map: lspriteSheet,
        transparent: true,
      }),
    [lspriteSheet]
  );

  useEffect(() => {
    return () => {
      material.dispose();
    };
  }, [material]);

  return (
    <group {...props}>
      <sprite material={material} />
    </group>
  );
}
