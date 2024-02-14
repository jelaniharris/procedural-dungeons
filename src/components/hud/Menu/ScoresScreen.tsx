import Button from '@/components/input/Button';
import { getDailyUniqueSeed } from '@/utils/seed';
import { useState } from 'react';
import { ScoreList } from '../ScoreList';
import { LocalScoresList } from '../scores/LocalScoresList';
import useMainMenuContext from '../useMainMenuContext';

const ScoresScreen = () => {
  const [tab, setTab] = useState('local');
  const { popScreen } = useMainMenuContext();

  return (
    <>
      <h1 className="text-white text-2xl font-bold">Scores</h1>

      <div className="flex flex-row gap-3 my-3">
        <Button
          onClick={() => {
            setTab('local');
          }}
        >
          Local
        </Button>
        <Button
          onClick={() => {
            setTab('daily');
          }}
        >
          Daily
        </Button>
        <Button
          onClick={() => {
            setTab('adventure');
          }}
        >
          Adventure
        </Button>
      </div>
      {tab === 'local' && (
        <>
          <h2 className="text-xl text-white font-bold">Last Climbs</h2>
          <div className="overflow-y-scroll" style={{ height: '50vh' }}>
            <LocalScoresList showAllAttempts={true} />
          </div>
        </>
      )}
      {tab === 'daily' && (
        <>
          <h2 className="text-xl text-white font-bold">Daily Scores</h2>
          <ScoreList gameType={'daily'} seed={getDailyUniqueSeed()} />
        </>
      )}
      {tab === 'adventure' && (
        <>
          <h2 className="text-xl text-white font-bold">Adventure Scores</h2>
          <ScoreList gameType={'adventure'} />
        </>
      )}
      <div className="flex-auto"></div>
      <Button variant="danger" type="submit" onClick={() => popScreen()}>
        Back
      </Button>
    </>
  );
};

export default ScoresScreen;
