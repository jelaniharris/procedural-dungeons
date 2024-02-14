import { RunData } from '@/components/types/RecordTypes';
import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const LocalScoresList = ({
  showAllAttempts,
}: {
  showAllAttempts: boolean;
}) => {
  const [attempts, setAttempts] = useState<RunData[]>([]);
  const getLocalAttempts = useStore(
    (store: GameState) => store.getLocalAttempts
  );

  useEffect(() => {
    setAttempts(getLocalAttempts(showAllAttempts));
  }, [getLocalAttempts]);

  const AttemptComponentRow = ({ attempt }: { attempt: RunData }) => {
    return (
      <tr className="">
        <td className="text-center">{attempt.type}</td>
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
            <span className="font-bold text-red-400">Failure</span>
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
          <th className="px-6 py-3">Game</th>
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
