import { trpc } from '@/app/_trpc/client';
import { IScore } from '@/server/models/score.schema';

interface UseGetScoresProps {
  gameType: string;
  seed?: number | undefined;
}

export const useGetScores = ({ gameType, seed }: UseGetScoresProps) => {
  const { data, isLoading, isSuccess, isError, error } =
    trpc.getScores.useQuery<IScore[]>(
      {
        gameType: gameType,
        ...(gameType != 'adventure' && { seed: seed }),
      },
      { initialData: [] }
    );

  return {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
  };
};
