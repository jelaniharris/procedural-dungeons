import { trpc } from '@/app/_trpc/client';
import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { getPlayerLocalData } from '@/utils/playerUtils';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Button from '../input/Button';
import { CHANGE_SCENE } from '../types/EventTypes';
import { RunData } from '../types/RecordTypes';
import useGame from '../useGame';
import CenterScreenContainer from './CenterScreen';

export const EndScreen = () => {
  const score = useStore((store: GameState) => store.score);
  const startGame = useStore((store: GameState) => store.startGame);
  const isDead = useStore((store: GameState) => store.isDead);
  const gameType = useStore((store: GameState) => store.gameType);
  const seed = useStore((store: GameState) => store.seed);
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const getLocalAttempts = useStore(
    (store: GameState) => store.getLocalAttempts
  );
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
    startGame(gameType);
  };

  const backToMainMenu = () => {
    setCurrentHud('mainmenu');
    publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  const GameHistoryList = () => {
    const [attempts, setAttempts] = useState<RunData[]>([]);
    useEffect(() => {
      setAttempts(getLocalAttempts());
    }, []);

    const AttemptComponentRow = ({ attempt }: { attempt: RunData }) => {
      return (
        <tr className="">
          <td
            className={cn(
              'text-center',
              attempt.success ? '' : 'text-stone-300 line-through'
            )}
          >
            {attempt.score}
          </td>
          <td className="text-center">{attempt.level}</td>
          <td className="text-center">
            {attempt.success ? (
              <span className="font-bold text-green-300">Success</span>
            ) : (
              <span className="font-bold text-red-600">Failure</span>
            )}
          </td>
          <td className="text-center">{attempt.date}</td>
        </tr>
      );
    };

    return (
      <table className="w-full table-auto overflow-y-scroll rounded-lg bg-slate-200 bg-opacity-30 p-3 text-white">
        <thead className="rounded-lg bg-slate-400">
          <tr>
            <th className="px-6 py-3">Score</th>
            <th className="px-6 py-3">Floor</th>
            <th className="px-6 py-3">Result</th>
            <th className="px-6 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="">
          {attempts.map((attempt) => (
            <AttemptComponentRow
              key={`attempt-${attempt.id || uuidv4()}`}
              attempt={attempt}
            />
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <CenterScreenContainer>
      {isDead && (
        <h1 className="text-8xl font-bold text-red-500">GOT GREEDY</h1>
      )}
      {!isDead && (
        <h1 className="text-8xl font-bold text-green-500">ESCAPED</h1>
      )}

      <span className="text-4xl font-bold text-white">
        Final Score: {score}
      </span>
      <div className="overflow-y-scroll" style={{ height: '50vh' }}>
        <GameHistoryList />
      </div>
      <div className="flex-auto"></div>
      <div className="pb-3 flex items-center gap-5">
        <Button onClick={restartGame}>Go Again</Button>
        <Button onClick={backToMainMenu} variant="danger">
          Back to Menu
        </Button>
      </div>
    </CenterScreenContainer>
  );
};
