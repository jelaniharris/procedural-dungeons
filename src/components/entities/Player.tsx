import { useStore } from '@/stores/useStore';
import * as THREE from 'three';
import { CharacterController } from '../CharacterController';
import { FollowCamera } from '../FollowCamera';
import { CharacterPlayer } from '../models/characters/CharacterPlayer';
import GameObject from './GameObject';

const Player = () => {
  const playerPosition = useStore((state) => state.playerPosition);
  const playerRotation = useStore((state) => state.playerRotation);

  return (
    <>
      <FollowCamera />
      <GameObject
        name="player"
        position={
          new THREE.Vector3(playerPosition.x || 0, 0, playerPosition.y || 0)
        }
        rotation={[0, playerRotation, 0]}
      >
        <CharacterController />
        <CharacterPlayer />
      </GameObject>
    </>
  );
};

export default Player;
