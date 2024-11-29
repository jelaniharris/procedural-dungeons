import Button from '@/components/input/Button';
import { FaArrowLeft, FaUser } from 'react-icons/fa';
import useMainMenuContext from '../useMainMenuContext';
import EODTimer from './EodTimer';
import ScreenHeader from './ScreenHeader';

const PlayScreen = () => {
  const { pushToScreen, popScreen, playGame } = useMainMenuContext();

  return (
    <>
      <ScreenHeader />
      <div className="grid grid-cols-2 gap-4 items-center m-auto">
        <Button onClick={() => playGame('daily')} className="">
          Daily Crawl
        </Button>
        <div className="font-bold text-white bg-slate-600 p-3 text-left flex flex-col gap-2 ">
          <span>Tower changes everyday.</span>
          <div className="flex flex-row gap-2 text-sm md:text-base">
            Time left:
            <EODTimer />
          </div>
        </div>
        <Button onClick={() => playGame('adventure')} className="">
          Adventure
        </Button>
        <div className="font-bold text-white bg-slate-600 p-3 text-left">
          A new adventure everytime!
        </div>
      </div>
      <div className="flex-auto"></div>
      <Button
        onClick={() => pushToScreen('name')}
        leftIcon={<FaUser />}
        className="bg-yellow-700 hover:bg-yellow-600"
      >
        Change Name
      </Button>
      <div className="flex-auto"></div>
      <Button
        leftIcon={<FaArrowLeft />}
        variant="danger"
        onClick={() => popScreen()}
      >
        {'Back'}
      </Button>
    </>
  );
};

export default PlayScreen;
