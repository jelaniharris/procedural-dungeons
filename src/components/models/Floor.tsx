'use client';

import React from 'react';
import { CloneProps, useGLTF } from '@react-three/drei';
import { Clone } from '@react-three/drei';

function Floor(props: CloneProps) {
  const { scene } = useGLTF('/floor.glb');
  return <Clone {...props} object={scene} />;
}

useGLTF.preload('/floor.glb');

export default Floor;
