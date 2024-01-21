import { GameState, useStore } from '@/stores/useStore';
import { useKeyboardControls } from '@react-three/drei';
import { useCallback, useEffect } from 'react';
import {
  PLAYER_ATTEMPT_MOVE,
  PlayerAttemptMoveEvent,
} from './types/EventTypes';
import { Controls, Direction, GameStatus } from './types/GameTypes';
import useGame from './useGame';

export const CharacterController = () => {
  const gameStatus = useStore((store) => store.gameStatus);
  const getPlayerLocation = useStore((store) => store.getPlayerLocation);
  const setGameStatus = useStore((store: GameState) => store.setGameStatus);
  const setShowSettingsDialog = useStore(
    (store: GameState) => store.setShowSettingsDialog
  );
  const setShowStoreDialog = useStore(
    (store: GameState) => store.setShowStoreDialog
  );

  const { publish } = useGame();

  const forwardPressed = useKeyboardControls<Controls>(
    (state) => state.forward
  );
  const rightPressed = useKeyboardControls<Controls>((state) => state.right);
  const leftPressed = useKeyboardControls<Controls>((state) => state.left);
  const downPressed = useKeyboardControls<Controls>((state) => state.back);
  const stallPressed = useKeyboardControls<Controls>((state) => state.stall);
  const storePressed = useKeyboardControls<Controls>((state) => state.stats);
  const optionsPressed = useKeyboardControls<Controls>(
    (state) => state.options
  );

  const moveDirection = useCallback(() => {
    if (gameStatus != GameStatus.GAME_STARTED) {
      return false;
    }

    if (!getPlayerLocation) {
      return;
    }

    if (forwardPressed) {
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_NORTH,
      });
    } else if (downPressed) {
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_SOUTH,
      });
    } else if (rightPressed) {
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_EAST,
      });
    } else if (leftPressed) {
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

    if (storePressed) {
      console.log('Store is pressed');
      setShowStoreDialog(true);
      setGameStatus(GameStatus.GAME_MENU);
    }

    if (optionsPressed) {
      setShowSettingsDialog(true);
      setGameStatus(GameStatus.GAME_MENU);
    }
  }, [
    gameStatus,
    getPlayerLocation,
    forwardPressed,
    downPressed,
    rightPressed,
    leftPressed,
    stallPressed,
    storePressed,
    optionsPressed,
    publish,
    setShowStoreDialog,
    setGameStatus,
    setShowSettingsDialog,
  ]);

  useEffect(() => {
    moveDirection();
  }, [moveDirection]);

  return <></>;
};
