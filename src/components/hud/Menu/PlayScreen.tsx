import Button from '@/components/input/Button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FaArrowLeft, FaUser } from 'react-icons/fa';
import useMainMenuContext from '../useMainMenuContext';
import ScreenHeader from './ScreenHeader';

const EODTimer = () => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const timerInterval = useRef<NodeJS.Timer>();

  const updateTimer = useCallback(() => {
    const date = new Date();
    const second = date.getSeconds();
    const minute = date.getMinutes();
    const hour = date.getHours();

    const leftHour = 23 - hour;
    const leftMinute = 59 - minute;
    const leftSeconds = 59 - second;

    const leftTime = leftHour * 3600 + leftMinute * 60 + leftSeconds;

    const h = Math.floor(leftTime / 3600);
    const m = Math.floor((leftTime - h * 3600) / 60);
    const s = Math.floor(leftTime % 60);
    setHours(h);
    setMinutes(m);
    setSeconds(s);
  }, []);

  useEffect(() => {
    if (!timerInterval.current) {
      updateTimer();
      timerInterval.current = setInterval(updateTimer, 1000);
    }
  }, [updateTimer]);

  return (
    <span>{`${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</span>
  );
};

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
