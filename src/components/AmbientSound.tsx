import { useLoader, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const AmbientSound = ({ url }: { url: string }) => {
  const sound = useRef<THREE.PositionalAudio>(null);
  const { camera } = useThree();
  const [listener] = useState(() => new THREE.AudioListener());
  const buffer = useLoader(THREE.AudioLoader, url);
  useEffect(() => {
    if (sound && sound.current) {
      sound.current.setBuffer(buffer);
      sound.current.setRefDistance(1);
      sound.current.setLoop(true);
      sound.current.play();
    }
    camera.add(listener);
    return () => {
      camera.remove(listener);
    };
  }, [buffer, camera, listener]);

  return <positionalAudio ref={sound} args={[listener]} />;
};
