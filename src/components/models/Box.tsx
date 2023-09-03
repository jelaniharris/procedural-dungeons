import React, { useState } from 'react';
import { ThreeElements, extend } from '@react-three/fiber';
import { useSpring } from 'react-spring';
import { Mesh } from 'three';

const Box = (meshProps: ThreeElements['mesh']) => {
  const ref = React.useRef<Mesh>();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);
  const props = useSpring({
    scale: active ? [1.3, 1.3, 1.3] : [1, 1, 1],
    color: hovered ? 'green' : 'grey',
  });

  return (
    <mesh
      {...meshProps}
      ref={ref}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={() => setActive(!active)}
      scale={props.scale}
    >
      <boxGeometry attach="geometry" args={[1, 1, 1]} />
      <meshPhysicalMaterial attach="material" color={props.color} />
    </mesh>
  );
};

export default Box;
