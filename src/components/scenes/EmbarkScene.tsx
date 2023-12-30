import { GameState, useStore } from '@/stores/useStore';
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useRef, useState } from 'react';
import { Camera, Vector3 } from 'three';
import { degToRad } from 'three/src/math/MathUtils';
import { EmbarkRoom } from '../models/EmbarkRoom';
import { PlayerProp } from '../models/characters/PlayerProp';
import useGame from '../useGame';

const EmbarkScene = () => {
  const cameraRef = useRef(null);
  const [lookPoint] = useState<Vector3 | null>(new Vector3(-1, 0, -2));
  const assignSeed = useStore((store: GameState) => store.assignSeed);
  const [seed, setSeed] = useState(0);

  const { gameMode } = useGame();

  useEffect(() => {
    if (!seed) {
      const createdSeed = assignSeed(gameMode);
      setSeed(createdSeed);
    }
  }, [assignSeed, gameMode, seed]);

  useFrame(() => {
    if (lookPoint && cameraRef.current) {
      (cameraRef.current as Camera).lookAt(lookPoint);
    }
  });

  return (
    <>
      <Environment preset="warehouse" />
      <Suspense fallback={null}>
        <EmbarkRoom />
        <PerspectiveCamera
          name="follow-camera"
          ref={cameraRef}
          makeDefault={true}
          position={[2.5, 1, -2]}
        />
        <PlayerProp position={[1, 0, -2]} rotation={[0, degToRad(-90), 0]} />
        <OrbitControls target={[0, 0, 0]} />
      </Suspense>
    </>
  );
};
export default EmbarkScene;
