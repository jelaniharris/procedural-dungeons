import { GameState, useStore } from '@/stores/useStore';
import { useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Button from '../input/Button';
import { CHANGE_SCENE } from '../types/EventTypes';
import useGame from '../useGame';
import CenterScreenContainer from './CenterScreen';
import { LocalScoresList } from './scores/LocalScoresList';

export const EndScreen = () => {
  const score = useStore((store: GameState) => store.score);
  const isDead = useStore((store: GameState) => store.isDead);
  const { setCurrentHud, publish } = useGame();
  const scoreSaved = useRef(false);

  const restartGame = () => {
    setCurrentHud('embark');
    publish(CHANGE_SCENE, { nextScene: 'embark' });
    scoreSaved.current = false;
  };

  const backToMainMenu = () => {
    setCurrentHud('mainmenu');
    publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  return (
    <CenterScreenContainer>
      <div className="flex flex-col gap-1 text-center">
        {isDead && (
          <h1 className="text-5xl md:text-8xl font-bold text-red-500">
            GOT GREEDY
          </h1>
        )}
        {!isDead && (
          <h1 className="text-5xl md:text-8xl font-bold text-green-500">
            ESCAPED
          </h1>
        )}
        <span className="text-2xl md:text-4xl font-bold text-white">
          Final Score: {score}
        </span>
      </div>
      <div className="overflow-y-scroll" style={{ height: '65vh' }}>
        <LocalScoresList showAllAttempts={false} />
      </div>
      <div className="flex-auto"></div>
      <div className="pb-3 flex items-center gap-5">
        <Button onClick={restartGame} leftIcon={<FaArrowRight />}>
          Climb Again
        </Button>
        <Button
          onClick={backToMainMenu}
          variant="danger"
          leftIcon={<FaArrowLeft />}
        >
          Back to Menu
        </Button>
      </div>
    </CenterScreenContainer>
  );
};
