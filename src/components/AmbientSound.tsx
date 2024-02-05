import { GameState, useStore } from '@/stores/useStore';
import { useLoader, useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const AmbientSound = ({ url }: { url: string }) => {
  const { camera } = useThree();
  const [listener] = useState(() => new THREE.AudioListener());
  const sound = useRef<THREE.Audio>(new THREE.Audio(listener));
  const buffer = useLoader(THREE.AudioLoader, url);

  const settings = useStore((state: GameState) => state.settings);

  useEffect(() => {
    if (settings.music) {
      if (sound && sound.current) {
        console.log('[AmbientSound] Turning on');
        sound.current.setBuffer(buffer);
        //sound.current.setRefDistance(5);
        sound.current.setVolume(0.5 * ((settings.musicVolume || 0) / 100));
        sound.current.setLoop(true);
        if (!sound.current.isPlaying) {
          sound.current.play();
        }
      }
      camera.add(listener);
      //camera.add(sound);
    } else {
      if (sound && sound.current) {
        console.log('[AmbientSound] Turning off');
        sound.current.stop();
      }
    }
    return () => {
      camera.remove(listener);
      if (sound.current) {
        sound.current.stop();
      }
    };
  }, [buffer, camera, settings, listener]);

  return <></>;
};
