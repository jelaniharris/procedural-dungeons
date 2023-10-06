import { useKeyboardControls } from '@react-three/drei';
import { Controls, GameStatus } from './types/GameTypes';
import { useStore } from '@/stores/useStore';
import useGame from './useGame';
import { useCallback, useEffect } from 'react';

export const CharacterController = ({
  children,
}: {
  children?: React.ReactNode;
}) => {
  const adjustPlayer = useStore((store) => store.adjustPlayer);
  const gameStatus = useStore((store) => store.gameStatus);

  const { publish } = useGame();

  const forwardPressed = useKeyboardControls<Controls>(
    (state) => state.forward
  );
  const rightPressed = useKeyboardControls<Controls>((state) => state.right);
  const leftPressed = useKeyboardControls<Controls>((state) => state.left);
  const downPressed = useKeyboardControls<Controls>((state) => state.back);
  const stallPressed = useKeyboardControls<Controls>((state) => state.stall);

  const moveDirection = useCallback(() => {
    let movementValid = false;
    if (gameStatus != GameStatus.GAME_STARTED) {
      return false;
    }

    if (forwardPressed) {
      movementValid = adjustPlayer(0, -1);
    } else if (downPressed) {
      movementValid = adjustPlayer(0, 1);
    } else if (rightPressed) {
      movementValid = adjustPlayer(1, 0);
    } else if (leftPressed) {
      movementValid = adjustPlayer(-1, 0);
    }

    if (movementValid) {
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
      } else {
        console.debug('stall released');
      }
    }
  }, [
    adjustPlayer,
    downPressed,
    forwardPressed,
    gameStatus,
    leftPressed,
    publish,
    rightPressed,
    stallPressed,
  ]);

  useEffect(() => {
    moveDirection();
  }, [moveDirection]);

  return <>{children}</>;
};
