import { Clone, useGLTF } from '@react-three/drei';
import { Item as ItemType } from '../types/GameTypes';
import { forwardRef, useMemo, useRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';

export type ItemProps = {
  item: ItemType;
};

export const Item = forwardRef(function Item(props: ItemProps, forwardedRef) {
  const { name, position, rotates } = props.item;
  const { scene } = useGLTF(`/models/items/${name}.glb`);
  //const copiedScene = useMemo(() => scene.clone(), [scene]);
  //const myRef = useRef(null);
  const myRef = useRef(null);

  useImperativeHandle(forwardedRef, () => myRef.current);

  useFrame(() => {
    if (rotates && myRef && myRef.current && myRef.current.rotation) {
      myRef.current.rotation.y += Math.random() * 0.03;
    }
  });

  return (
    <Clone ref={myRef} object={scene} position={[position.x, 0, position.y]} />
  );
});
