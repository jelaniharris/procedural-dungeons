import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { /*OrbitControls,*/ PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import { useStore } from '@/stores/useStore';
import { shallow } from 'zustand/shallow';

export const FollowCamera = () => {
  const playerPosition = useStore((state) => state.playerPosition, shallow);
  const cameraRef = useRef(null);

  const lookAtVec = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraVector = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const cameraPosition = new THREE.Vector3(0, 0, 0);

  const stopLookAt = useRef<boolean>(false);

  /*const startDrag = () => {
    stopLookAt.current = true;
  };

  const endDrag = () => {
    stopLookAt.current = false;
  };*/

  console.log('[FollowCamera] Refollowing player position');

  useFrame((state) => {
    if (!playerPosition || stopLookAt.current) {
      return;
    }
    lookAtVec.current.set(playerPosition.x, 0, playerPosition.y);
    cameraVector.current.lerp(lookAtVec.current, 0.1);
    cameraPosition.set(playerPosition.x, 9, playerPosition.y + 6);
    state.camera.position.lerp(cameraPosition, 0.1);
    state.camera.lookAt(cameraVector.current);
    state.camera.updateProjectionMatrix();
  });
  return (
    <>
      <PerspectiveCamera ref={cameraRef} makeDefault position={[6, 3, 6]} />
      {/*<OrbitControls
        onStart={startDrag}
        enablePan={false}
        onEnd={endDrag}
        maxPolarAngle={THREE.MathUtils.degToRad(90)}
        target={[playerPosition.x, 0, playerPosition.y]}
  />*/}
    </>
  );
};
