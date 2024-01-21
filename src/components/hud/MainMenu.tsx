import { getPlayerLocalData } from '@/utils/playerUtils';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { CHANGE_SCENE } from '../types/EventTypes';
import { PlayerLocalData } from '../types/GameTypes';
import useGame from '../useGame';
import MainScreen from './Menu/MainScreen';
import PlayScreen from './Menu/PlayScreen';
import ScoresScreen from './Menu/ScoresScreen';
import TutorialScreen from './Menu/TutorialScreen';
import NameChangeScreen from './Menu/User/NameChangeScreen';
import { SettingsScreen } from './SettingsScreen';

export interface MainMenuContextValue {
  currentScreen: string[];
  pushToScreen: (name: string) => void;
  popScreen: () => void;
  playGame: (gameType?: string) => void;
  playerData: PlayerLocalData | null;
  setPlayerData: Dispatch<SetStateAction<PlayerLocalData | null>>;
  nameChangeStep: number;
  advanceNameChangeFormStep: (step: number) => void;
}

export const MainMenuContext = React.createContext<MainMenuContextValue | null>(
  null
);

const MainMenu = () => {
  const [currentScreen, setCurrentScreen] = useState<string[]>(['main']);
  const [playerData, setPlayerData] = useState<PlayerLocalData | null>(null);
  const { setCurrentHud, publish, setGameMode } = useGame();
  const [nameChangeStep, setNameChangeStep] = useState(1);

  const mainMenuApi = useMemo<MainMenuContextValue>(
    () => ({
      currentScreen,
      playerData,
      setPlayerData,
      nameChangeStep,
      pushToScreen(name: string) {
        if (name === 'play' && (!playerData || playerData.name.length <= 0)) {
          setCurrentScreen(['name', ...currentScreen]);
        } else {
          setCurrentScreen([name, ...currentScreen]);
        }
      },
      popScreen() {
        if (currentScreen.length != 1) {
          setCurrentScreen(currentScreen.slice(1));
        }
      },
      playGame(gameType = 'daily') {
        setCurrentHud('embark');
        setGameMode(gameType);
        publish(CHANGE_SCENE, { nextScene: 'embark' });
      },
      advanceNameChangeFormStep(step: number) {
        setNameChangeStep(step);
      },
    }),
    [
      currentScreen,
      nameChangeStep,
      playerData,
      publish,
      setCurrentHud,
      setGameMode,
    ]
  );

  const settingsMenuCallback = () => {
    mainMenuApi.popScreen();
  };

  useEffect(() => {
    const player = getPlayerLocalData();
    setPlayerData(player);
  }, []);

  const ShowScreen = () => {
    switch (currentScreen[0]) {
      case 'main':
        return <MainScreen />;
      case 'play':
        return <PlayScreen />;
      case 'settings':
        return (
          <SettingsScreen
            backToMenuCallback={settingsMenuCallback}
            backToMenuText="Back to Menu"
          />
        );
      case 'scores':
        return <ScoresScreen />;
      case 'tutorial':
        return <TutorialScreen />;
      case 'name':
        return <NameChangeScreen />;
      default:
        return <></>;
    }
  };

  return (
    <>
      <section className="fixed top-0 z-10 w-full h-full items-stretch">
        <section className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-700 bg-opacity-60">
          <MainMenuContext.Provider value={mainMenuApi}>
            <ShowScreen />
          </MainMenuContext.Provider>
        </section>
      </section>
    </>
  );
};

export default MainMenu;
