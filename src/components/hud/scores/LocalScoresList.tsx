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

  const rowHeaderStyles = 'px-2 md:px-6 py-2 md:py-3';

  return (
    <table className="w-full table-auto overflow-y-scroll rounded-lg bg-slate-200 bg-opacity-30 p-2 text-white">
      <thead className="rounded-lg bg-slate-400">
        <tr className="">
          <th className={rowHeaderStyles}>Game</th>
          <th className={rowHeaderStyles}>Score</th>
          <th className={rowHeaderStyles}>Floor</th>
          <th className={rowHeaderStyles}>Result</th>
          <th className={rowHeaderStyles}>Date</th>
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
