import { trpc } from '@/app/_trpc/client';
import { GameState, useStore } from '@/stores/useStore';
import { getPlayerLocalData } from '@/utils/playerUtils';
import { useEffect, useRef } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Button from '../input/Button';
import { CHANGE_SCENE } from '../types/EventTypes';
import useGame from '../useGame';
import CenterScreenContainer from './CenterScreen';
import { LocalScoresList } from './scores/LocalScoresList';

export const EndScreen = () => {
  const score = useStore((store: GameState) => store.score);
  const isDead = useStore((store: GameState) => store.isDead);
  const gameType = useStore((store: GameState) => store.gameType);
  const seed = useStore((store: GameState) => store.seed);
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const { setCurrentHud, publish } = useGame();
  const saveScore = trpc.saveScore.useMutation();
  const scoreSaved = useRef(false);

  useEffect(() => {
    const sendPlayerScore = async () => {
      const player = getPlayerLocalData();
      if (player) {
        console.log(
          `Got player, saving score ${score} for game mode ${gameType}`
        );
        saveScore.mutate({
          name: player.name,
          discriminator: player.discriminator,
          score: score,
          gameType: gameType,
          seed: seed,
          level: currentLevel,
          country: player.country ?? '',
        });
        scoreSaved.current = true;
      }
    };

    if (!scoreSaved.current) {
      //if (!isDead) {
      sendPlayerScore();
      //} else {
      //        console.log('Player is dead. Not sending score.');
      //    }
    } else {
      console.log('Score already saved.');
    }
  }, [gameType, isDead, score, seed]);

  const restartGame = () => {
    setCurrentHud('embark');
    publish(CHANGE_SCENE, { nextScene: 'embark' });
  };

  const backToMainMenu = () => {
    setCurrentHud('mainmenu');
    publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  return (
    <CenterScreenContainer>
      {isDead && (
        <h1 className="text-3xl md:text-8xl font-bold text-red-500">
          GOT GREEDY
        </h1>
      )}
      {!isDead && (
        <h1 className="text-3xl md:text-8xl font-bold text-green-500">
          ESCAPED
        </h1>
      )}

      <span className="text-2xl md:text-4xl font-bold text-white">
        Final Score: {score}
      </span>
      <div className="overflow-y-scroll" style={{ height: '50vh' }}>
        <LocalScoresList />
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
