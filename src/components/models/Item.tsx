import { Clone, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Group } from 'three';
import { Item as ItemType } from '../types/GameTypes';

export type ItemProps = {
  item: ItemType;
};

export const Item = forwardRef(function Item(props: ItemProps, forwardedRef) {
  const { name, position, modelRotation, modelPositionOffset, rotates } =
    props.item;
  const { scene } = useGLTF(`/models/items/${name}.glb`);
  //const copiedScene = useMemo(() => scene.clone(), [scene]);
  //const myRef = useRef(null);
  const myRef = useRef<Group>(null);

  useImperativeHandle(forwardedRef, () => myRef.current);

  useFrame(() => {
    if (rotates && myRef && myRef.current && myRef.current.rotation) {
      myRef.current.rotation.y += Math.random() * 0.03;
    }
  });

  return (
    <Clone
      ref={myRef}
      object={scene}
      position={[
        position.x + modelPositionOffset.x,
        0 + modelPositionOffset.y,
        position.y + modelPositionOffset.z,
      ]}
      rotation={[modelRotation.x, modelRotation.y, modelRotation.z]}
    />
  );
});
