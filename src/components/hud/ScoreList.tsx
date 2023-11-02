import { trpc } from '@/app/_trpc/client';
import { GetScoresResult } from '@/server/models/score';
import { v4 as uuidv4 } from 'uuid';

interface ScoreListProps {
  gameType: string;
  seed?: number;
}

export const ScoreList = ({ gameType, seed }: ScoreListProps) => {
  const { isLoading, data } = trpc.getScores.useQuery<GetScoresResult[]>(
    {
      gameType: gameType,
      seed: seed,
    },
    { initialData: [] }
  );

  const ScoreRow = ({ score }: { score: GetScoresResult }) => {
    return (
      <tr>
        <td className="px-6 py-3">{`${score.name}:${score.discriminator}`}</td>
        <td className="px-6 py-3">{score.score}</td>
        <td className="px-6 py-3">{score.level}</td>
      </tr>
    );
  };

  if (isLoading) {
    return <>Loading</>;
  }

  return (
    <table className="table-auto overflow-y-scroll rounded-lg bg-slate-200 bg-opacity-30 p-3 text-white">
      <thead className="rounded-lg bg-slate-400">
        <tr>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Score</th>
          <th className="px-6 py-3">Level</th>
        </tr>
      </thead>
      <tbody className="">
        {data &&
          data.map((score) => (
            <ScoreRow key={`score-${uuidv4()}`} score={score} />
          ))}
      </tbody>
    </table>
  );
};
