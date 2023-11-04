import Button from '@/components/input/Button';
import useMainMenuContext from '../useMainMenuContext';
import ScreenHeader from './ScreenHeader';

const PlayScreen = () => {
  const { pushToScreen, popScreen, playGame } = useMainMenuContext();

  return (
    <>
      <ScreenHeader />
      <div className="grid grid-cols-2 gap-4 items-center m-auto">
        <div className="text-right">
          <Button onClick={() => playGame('daily')} className="">
            Daily Crawl
          </Button>
        </div>
        <div className="font-bold text-white bg-slate-600 p-3 text-left ">
          Tower changes everyday.
        </div>
        <Button onClick={() => playGame('adventure')} className="">
          Adventure
        </Button>
        <div className="font-bold text-white bg-slate-600 p-3  text-left ">
          A new adventure everytime!
        </div>
        <Button onClick={() => pushToScreen('name')}>Change Name</Button>
      </div>
      <div className="flex-auto"></div>
      <Button variant="danger" onClick={() => popScreen()}>
        {'< Back'}
      </Button>
    </>
  );
};

export default PlayScreen;
