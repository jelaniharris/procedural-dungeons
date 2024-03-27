import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { FaHourglass } from 'react-icons/fa';
import {
  PLAYER_ATTEMPT_MOVE,
  PlayerAttemptMoveEvent,
} from './types/EventTypes';
import { Direction } from './types/GameTypes';
import useGame from './useGame';

export const GuiButtons = () => {
  const { publish } = useGame();
  const getPlayerLocation = useStore((store) => store.getPlayerLocation);
  const showExitDialog = useStore((store: GameState) => store.showExitDialog);

  const waitAction = () => {
    publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
      currentPosition: getPlayerLocation(),
      desiredDirection: Direction.DIR_NONE,
    });
  };

  if (showExitDialog) {
    return <></>;
  }

  return (
    <div className="absolute left-[90%] md:left-[65%] top-[90%]">
      <div
        onClick={waitAction}
        className={cn(
          'absolute cursor-pointer flex flex-col items-center justify-center',
          'w-14 h-14 ml-[-56px] mt-[-56px]',
          'bg-[url("/touch/transparentLight10.png")] bg-center bg-cover'
        )}
      >
        <span className="text-2xl text-slate-600">
          <FaHourglass />
        </span>
      </div>
    </div>
  );
};
