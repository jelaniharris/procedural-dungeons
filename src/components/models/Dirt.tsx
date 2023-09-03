'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import { ThreeElements } from '@react-three/fiber';

function Dirt(props: ThreeElements['primitive']) {
  const { scene } = useGLTF('/dirt.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive {...props} object={copiedScene} />;
}

useGLTF.preload('/dirt.glb');

export default Dirt;
