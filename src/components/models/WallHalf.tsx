'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

function WallHalf(props) {
  const { scene } = useGLTF('/wall-half.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive {...props} object={copiedScene} />;
}

useGLTF.preload('/wall-half.glb');

export default WallHalf;
