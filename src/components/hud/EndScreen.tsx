import { GameState, useStore } from '@/stores/useStore';
import { useEffect, useState } from 'react';
import { RunData } from '../types/RecordTypes';
import { v4 as uuidv4 } from 'uuid';
import classnames from 'classnames';

export const EndScreen = () => {
  const score = useStore((store: GameState) => store.score);
  const startGame = useStore((store: GameState) => store.startGame);
  const isDead = useStore((store: GameState) => store.isDead);
  const gameType = useStore((store: GameState) => store.gameType);
  const getLocalAttempts = useStore(
    (store: GameState) => store.getLocalAttempts
  );

  const restartGame = () => {
    startGame(gameType);
  };

  const GameHistoryList = () => {
    const [attempts, setAttempts] = useState<RunData[]>([]);
    useEffect(() => {
      setAttempts(getLocalAttempts());
    }, []);

    const AttemptComponentRow = ({ attempt }: { attempt: RunData }) => {
      return (
        <tr>
          <td
            className={classnames(
              'text-center',
              attempt.success ? '' : 'line-through text-stone-300'
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
      <table className="table-auto p-3 rounded-lg text-white bg-slate-200 bg-opacity-30">
        <thead className="bg-slate-400 rounded-lg">
          <tr>
            <th className="px-6 py-3">Score</th>
            <th className="px-6 py-3">Floor</th>
            <th className="px-6 py-3">Result</th>
            <th className="px-6 py-3">Date</th>
          </tr>
        </thead>
        <tbody>
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
    <section className="fixed top-0 w-full items-stretch min-h-screen">
      <section className="bg-slate-700 bg-opacity-60 m-8 flex flex-col gap-5 justify-center items-center min-h-[100svh]">
        {isDead && <h1 className="text-8xl font-bold text-red-500">DEAD</h1>}
        {!isDead && (
          <h1 className="text-8xl font-bold text-green-500">ESCAPED</h1>
        )}

        <span className="text-4xl font-bold text-white">
          Final Score: {score}
        </span>
        <GameHistoryList />
        <button
          onClick={restartGame}
          className="bg-purple-700 text-white font-bold p-4"
        >
          Go Again
        </button>
      </section>
    </section>
  );
};
