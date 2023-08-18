'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

function Dirt(props) {
  const { scene } = useGLTF('/dirt.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive {...props} object={copiedScene} />;
}

useGLTF.preload('/dirt.glb');

export default Dirt;
