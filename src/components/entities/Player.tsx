import { useStore } from '@/stores/useStore';
import { CharacterController } from '../CharacterController';
import { CharacterPlayer } from '../models/characters/CharacterPlayer';
import * as THREE from 'three';
import { FollowCamera } from '../FollowCamera';

const Player = () => {
  const playerPosition = useStore((state) => state.playerPosition);
  const playerRotation = useStore((state) => state.playerRotation);

  //console.debug('[Player|Component] Position updated:', playerPosition);

  return (
    <>
      <FollowCamera />
      <CharacterController>
        <CharacterPlayer
          position={
            new THREE.Vector3(playerPosition.x || 0, 0, playerPosition.y || 0)
          }
          rotation={[0, playerRotation, 0]}
        />
      </CharacterController>
    </>
  );
};

export default Player;
