import { trpc } from '@/app/_trpc/client';
import Button from '@/components/input/Button';
import { getDailyUniqueSeed } from '@/utils/seed';
import useMainMenuContext from '../useMainMenuContext';
import ScreenHeader from './ScreenHeader';

const ScoresScreen = () => {
  const { popScreen } = useMainMenuContext();
  const getScores = trpc.getScores.useQuery({
    gameType: 'daily',
    seed: getDailyUniqueSeed(),
  });

  const ScoreListing = () => {
    if (!getScores || !getScores.data) {
      return <></>;
    }
    return <p>{JSON.stringify(getScores.data)}</p>;
  };

  return (
    <>
      <ScreenHeader />
      <div className="flex-auto"></div>
      <h2>Daily Scores</h2>
      <ScoreListing />
      <div className="flex-auto"></div>
      <Button variant="danger" type="submit" onClick={() => popScreen()}>
        Back
      </Button>
    </>
  );
};

export default ScoresScreen;
