import Button from '../input/Button';
import { CHANGE_SCENE } from '../types/EventTypes';
import useGame from '../useGame';

export const EmbarkScreen = () => {
  //const [currentScreen, setCurrentScreen] = useState<string[]>(['main']);
  //const [playerData, setPlayerData] = useState<PlayerLocalData | null>(null);
  const { setCurrentHud, publish } = useGame();

  const embarkGame = () => {
    setCurrentHud('game');
    //setGameMode(gameType);
    publish(CHANGE_SCENE, { nextScene: 'dungeon' });
  };

  const backToMainMenu = () => {
    setCurrentHud('mainmenu');
    publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  return (
    <>
      <section className="fixed top-0 z-10 w-full h-full items-stretch">
        <section className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-700 bg-opacity-60">
          <div className="flex-auto"></div>
          <div className="flex flex-col gap-3">
            <Button onClick={embarkGame} className="text-5xl">
              Embark
            </Button>
            <Button variant="danger" onClick={backToMainMenu}>
              Back to Menu
            </Button>
          </div>
        </section>
      </section>
    </>
  );
};
