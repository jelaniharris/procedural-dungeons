import { useStore } from '@/stores/useStore';
import { useKeyboardControls } from '@react-three/drei';
import { useCallback, useEffect } from 'react';
import {
  PLAYER_ATTEMPT_MOVE,
  PlayerAttemptMoveEvent,
} from './types/EventTypes';
import { Controls, Direction, GameStatus } from './types/GameTypes';
import useGame from './useGame';

export const CharacterController = () => {
  const adjustPlayer = useStore((store) => store.adjustPlayer);
  const gameStatus = useStore((store) => store.gameStatus);
  const getPlayerLocation = useStore((store) => store.getPlayerLocation);

  const { publish } = useGame();

  const forwardPressed = useKeyboardControls<Controls>(
    (state) => state.forward
  );
  const rightPressed = useKeyboardControls<Controls>((state) => state.right);
  const leftPressed = useKeyboardControls<Controls>((state) => state.left);
  const downPressed = useKeyboardControls<Controls>((state) => state.back);
  const stallPressed = useKeyboardControls<Controls>((state) => state.stall);

  const moveDirection = useCallback(() => {
    //let movementValid = false;
    if (gameStatus != GameStatus.GAME_STARTED) {
      return false;
    }
    //const noClipMode = false;

    if (!getPlayerLocation) {
      return;
    }

    if (forwardPressed) {
      //movementValid = adjustPlayer(0, -1, noClipMode);
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_NORTH,
      });
    } else if (downPressed) {
      //movementValid = adjustPlayer(0, 1, noClipMode);
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_SOUTH,
      });
    } else if (rightPressed) {
      //movementValid = adjustPlayer(1, 0, noClipMode);
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_EAST,
      });
    } else if (leftPressed) {
      //movementValid = adjustPlayer(-1, 0, noClipMode);
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_WEST,
      });
    } else if (stallPressed) {
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_NONE,
      });
    }

    /*if (movementValid) {
      if (forwardPressed || downPressed || rightPressed || leftPressed) {
        console.debug(
          `[CharacterController|Component] Moving ${forwardPressed}|${rightPressed}|${downPressed}|${leftPressed}`
        );
        publish('player-moved', { moved: true });
      } else {
        //console.log('Let go of button');
      }
    } else {
      // Movement is not valid
      if (stallPressed) {
        console.debug(`[CharacterController|Component] wait`);
        publish('player-moved', { moved: false });
      }
    }*/
  }, [
    adjustPlayer,
    downPressed,
    forwardPressed,
    gameStatus,
    getPlayerLocation,
    leftPressed,
    publish,
    rightPressed,
    stallPressed,
  ]);

  useEffect(() => {
    moveDirection();
  }, [moveDirection]);

  return <></>;
};
