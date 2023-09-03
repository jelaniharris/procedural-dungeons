'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';

function Wall(props: ThreeElements['primitive']) {
  const { scene } = useGLTF('/wall.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive {...props} object={copiedScene} />;
}

useGLTF.preload('/wall.glb');

export default Wall;
