import { useGetScores } from '@/hooks/useGetScores';
import { IScore } from '@/server/models/score.schema';
import { v4 as uuidv4 } from 'uuid';

interface ScoreListProps {
  gameType: string;
  seed?: number;
}

export const ScoreList = ({ gameType, seed }: ScoreListProps) => {
  const { isLoading, data } = useGetScores({
    gameType,
    seed,
  });

  const ScoreRow = ({ score, index }: { score: IScore; index: number }) => {
    let countryFlagSrc: string | undefined;
    let countryAlt: string = '';
    if (score.country && score.country.length > 0) {
      countryAlt = score.country;
      countryFlagSrc = `https://flagcdn.com/32x24/${score.country.toLowerCase()}.png`;
    }

    return (
      <tr>
        <td className="px-6 py-3">{`# ${index + 1}`}</td>
        <td className="px-6 py-3 flex flex-row items-center flex-nowrap gap-2">
          {countryFlagSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={countryFlagSrc} alt={countryAlt} width={32} height={24} />
          )}
          {`${score.name}:${score.discriminator}`}
        </td>
        <td className="px-6 py-3">{`${score.score}`}</td>
        <td className="px-6 py-3">{score.level}</td>
        {gameType === 'adventure' && (
          <td className="px-6 py-3">
            {score.updatedAt
              ? new Date(score.updatedAt).toLocaleDateString()
              : '??'}
          </td>
        )}
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
          <th className="px-6 py-3">Rank</th>
          <th className="px-6 py-3">Name</th>
          <th className="px-6 py-3">Score</th>
          <th className="px-6 py-3">Level</th>
          {gameType === 'adventure' && <th className="px-6 py-3">Date</th>}
        </tr>
      </thead>
      <tbody className="">
        {data &&
          data.map((data: IScore, index: number) => (
            <ScoreRow key={`score-${uuidv4()}`} score={data} index={index} />
          ))}
      </tbody>
    </table>
  );
};
