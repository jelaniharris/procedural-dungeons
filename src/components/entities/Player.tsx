import { GameState, useStore } from '@/stores/useStore';
//import * as THREE from 'three';
import { CharacterController } from '../CharacterController';
import { CharacterPlayer } from '../models/characters/CharacterPlayer';
import GameObject from './GameObject';
//import { useRef } from 'react';
import { MoveableObject } from './MoveableObject';

const Player = () => {
  const playerPosition = useStore((state: GameState) => state.playerPosition);
  const playerZOffset = useStore((state: GameState) => state.playerZOffset);
  const playerRotation = useStore((state: GameState) => state.playerRotation);

  console.log('[Player] Rerendered player: ', playerRotation);

  return (
    <>
      <GameObject
        name="player"
        transform={playerPosition}
        zOffset={playerZOffset}
        rotation={playerRotation}
      >
        <MoveableObject />
        <CharacterController />
        <CharacterPlayer />
      </GameObject>
    </>
  );
};

export default Player;
