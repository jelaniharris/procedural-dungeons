'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

function Wall(props) {
  const { scene } = useGLTF('/wall.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive {...props} object={copiedScene} />;
}

useGLTF.preload('/wall.glb');

export default Wall;
