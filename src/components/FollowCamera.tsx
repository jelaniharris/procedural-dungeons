import { useFrame, useThree } from '@react-three/fiber';
import { useGameContext } from './context/GameContext';
import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import { useStore } from '@/stores/useStore';

export const FollowCamera = () => {
  const playerPosition = useStore((state) => state.playerPosition);
  const cameraRef = useRef(null);

  const lookAtVec = new THREE.Vector3(0, 0, 0);
  const cameraVector = new THREE.Vector3(0, 0, 0);
  const cameraPosition = new THREE.Vector3(0, 0, 0);

  useFrame((state) => {
    if (!playerPosition) {
      return;
    }
    lookAtVec.set(playerPosition.x, 0, playerPosition.y);
    cameraVector.lerp(lookAtVec, 0.1);
    cameraPosition.set(playerPosition.x, 9, playerPosition.y + 6);
    state.camera.position.lerp(cameraPosition, 0.1);
    state.camera.lookAt(cameraVector);
    state.camera.updateProjectionMatrix();
  });
  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[6, 3, 6]} />
      <OrbitControls />
    </>
  );
};
