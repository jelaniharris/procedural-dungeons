import Image from 'next/image';
import Button from '../input/Button';
import { CHANGE_SCENE } from '../types/EventTypes';
import useGame from '../useGame';

const MainMenu = () => {
  const { setCurrentHud, publish } = useGame();

  const playGame = () => {
    setCurrentHud('game');
    publish(CHANGE_SCENE, { nextScene: 'dungeon' });
  };

  return (
    <>
      <section className="fixed top-0 z-10 w-full h-full items-stretch p-8">
        <section className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-700 bg-opacity-60">
          <Image
            src="/textures/Tower Of Greed Logo.png"
            width={600}
            height={600}
            alt="Tower of Greed Logo"
          />
          <Button onClick={playGame}>Play Game</Button>
          <Button>Tutorial</Button>
          <Button>Scores</Button>
          <Button>Settings</Button>
        </section>
      </section>
    </>
  );
};

export default MainMenu;
