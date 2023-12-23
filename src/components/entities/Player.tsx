import { useStore } from '@/stores/useStore';
//import * as THREE from 'three';
import { CharacterController } from '../CharacterController';
import { CharacterPlayer } from '../models/characters/CharacterPlayer';
import GameObject from './GameObject';
//import { useRef } from 'react';
import { MoveableObject } from './MoveableObject';

const Player = () => {
  const playerPosition = useStore((state) => state.playerPosition);
  const playerRotation = useStore((state) => state.playerRotation);

  console.log('[Player] Rerendered player');

  return (
    <>
      <GameObject
        name="player"
        transform={playerPosition}
        rotation={[0, playerRotation, 0]}
      >
        <MoveableObject />
        <CharacterController />
        <CharacterPlayer />
      </GameObject>
    </>
  );
};

export default Player;
