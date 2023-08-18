'use client';

import React, { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';

function Floor(props) {
  const { scene } = useGLTF('/floor.glb');
  const copiedScene = useMemo(() => scene.clone(), [scene]);
  return <primitive {...props} object={copiedScene} />;
}

useGLTF.preload('/floor.glb');

export default Floor;
