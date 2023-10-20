import Image from 'next/image';
import { useState } from 'react';
import Button from '../input/Button';
import { CHANGE_SCENE } from '../types/EventTypes';
import useGame from '../useGame';

const MainMenu = () => {
  const [currentScreen, setCurrentScreen] = useState('main');
  const { setCurrentHud, publish } = useGame();

  const playGame = () => {
    setCurrentHud('game');
    publish(CHANGE_SCENE, { nextScene: 'dungeon' });
  };

  const PlayScreen = () => {
    return (
      <>
        <ScreenHeader />
        <div className="grid grid-cols-2 gap-4 items-center m-auto">
          <div className="text-right">
            <Button onClick={playGame} className="">
              Daily Crawl
            </Button>
          </div>
          <div className="font-bold text-white bg-slate-600 p-3 text-left ">
            Tower changes everyday.
          </div>
          <Button disabled className="">
            Adventure
          </Button>
          <div className="font-bold text-white bg-slate-600 p-3  text-left ">
            A new adventure everytime!
          </div>
        </div>
        <div className="flex-auto"></div>
        <Button onClick={() => setCurrentScreen('main')}>{'< Back'}</Button>
      </>
    );
  };

  const ScreenHeader = () => {
    return (
      <div className="relative flex flex-col">
        <Image
          src="/textures/Tower Of Greed Logo.png"
          width={500}
          height={500}
          priority
          alt="Tower of Greed Logo"
        />
      </div>
    );
  };

  const MainScreen = () => {
    return (
      <>
        <ScreenHeader />
        <Button onClick={() => setCurrentScreen('play')}>Play Game</Button>
        <Button>Tutorial</Button>
        <Button>Scores</Button>
        <Button>Settings</Button>
        <div className="flex-auto"></div>
      </>
    );
  };

  const ShowScreen = () => {
    switch (currentScreen) {
      case 'main':
        return <MainScreen />;
      case 'play':
        return <PlayScreen />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <section className="fixed top-0 z-10 w-full h-full items-stretch">
        <section className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-700 bg-opacity-60">
          <ShowScreen />
        </section>
      </section>
    </>
  );
};

export default MainMenu;
