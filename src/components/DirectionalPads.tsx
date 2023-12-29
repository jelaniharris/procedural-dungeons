import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';
import {
  PLAYER_ATTEMPT_MOVE,
  PlayerAttemptMoveEvent,
} from './types/EventTypes';
import { Direction, GameStatus, TouchControls } from './types/GameTypes';
import useGame from './useGame';

const DirectionalPads = () => {
  const gameStatus = useStore((store) => store.gameStatus, shallow);
  const isPaused = useStore((store: GameState) => store.isPaused, shallow);
  const getPlayerLocation = useStore((store) => store.getPlayerLocation);
  const settings = useStore((state: GameState) => state.settings);
  const { publish } = useGame();
  const [showPad, setShowPad] = useState(true);
  const [debugMode] = useState(false);

  const moveDirection = (dir: Direction) => {
    switch (dir) {
      case Direction.DIR_NORTH:
        publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
          currentPosition: getPlayerLocation(),
          desiredDirection: Direction.DIR_NORTH,
        });
        break;
      case Direction.DIR_EAST:
        publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
          currentPosition: getPlayerLocation(),
          desiredDirection: Direction.DIR_EAST,
        });
        break;
      case Direction.DIR_SOUTH:
        publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
          currentPosition: getPlayerLocation(),
          desiredDirection: Direction.DIR_SOUTH,
        });
        break;
      case Direction.DIR_WEST:
        publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
          currentPosition: getPlayerLocation(),
          desiredDirection: Direction.DIR_WEST,
        });
        break;
      case Direction.DIR_NONE:
        publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
          currentPosition: getPlayerLocation(),
          desiredDirection: Direction.DIR_NONE,
        });
        break;
    }
  };

  useEffect(() => {
    if (
      isPaused ||
      gameStatus !== GameStatus.GAME_STARTED ||
      (settings && settings.touchControlType !== TouchControls.CONTROL_DPAD)
    ) {
      setShowPad(false);
    } else {
      setShowPad(true);
    }
  }, [isPaused, gameStatus, settings]);

  if (!showPad) {
    return null;
  }

  const cellStyling = cn('w-14 h-14', debugMode ? 'border-red-300 border' : '');
  return (
    <div
      className={cn(
        'dpad',
        'absolute block z-[999] bottom-28 left-[50%] top-[80%]',
        debugMode ? 'border-green-300 border' : ''
      )}
    >
      <div
        className={cn(
          'absolute ml-[-84px] mt-[-84px]',
          'bg-[url("/touch/transparentLight07.png")] bg-center bg-cover',
          debugMode ? 'border-green-300 border' : ''
        )}
      >
        <div className="flex flex-col ">
          <div className="flex flex-row">
            <div className={cn(cellStyling)}></div>
            <div
              className={cn(cellStyling)}
              onClick={() => moveDirection(Direction.DIR_NORTH)}
            ></div>
            <div className={cn(cellStyling)}></div>
          </div>
          <div className="flex flex-row items-center">
            <div
              className={cn(cellStyling)}
              onClick={() => moveDirection(Direction.DIR_WEST)}
            ></div>
            <div className={cn(cellStyling)}></div>
            <div
              className={cn(cellStyling)}
              onClick={() => moveDirection(Direction.DIR_EAST)}
            ></div>
          </div>
          <div className="flex flex-row">
            <div className={cn(cellStyling)}></div>
            <div
              className={cn(cellStyling)}
              onClick={() => moveDirection(Direction.DIR_SOUTH)}
            ></div>
            <div className={cn(cellStyling)}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DirectionalPads;
