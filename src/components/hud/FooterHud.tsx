import { GameState, useStore } from '@/stores/useStore';
import {
  FaBolt as EnergyIcon,
  FaHeart as HeartIcon,
  FaCoins as CoinIcon,
  FaLayerGroup as FloorIcon,
} from 'react-icons/fa';
import { EndScreen } from './EndScreen';
import { ExitOption } from './ExitOption';
import { GameStatus } from '../types/GameTypes';
import classNames from 'classnames';

export const FooterHud = () => {
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const score = useStore((store: GameState) => store.score);
  const energy = useStore((store: GameState) => store.energy);
  const isTired = useStore((store: GameState) => store.isTired);
  const health = useStore((store: GameState) => store.health);
  const maxHealth = useStore((store: GameState) => store.maxHealth);
  const showExitDialog = useStore((store: GameState) => store.showExitDialog);
  const gameStatus = useStore((store: GameState) => store.gameStatus);

  const PanelLabel = ({
    icon,
    iconClass = '',
    children,
  }: {
    icon: React.ReactNode;
    iconClass?: string;
    children: React.ReactNode;
  }) => {
    return (
      <div className="text-2xl font-bold flex gap-2">
        <span className={iconClass}>{icon}</span>
        <span className="text-white">{children}</span>
      </div>
    );
  };

  const ContentPanel = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <section
        className={classNames(
          ' bg-slate-700 bg-opacity-60 p-2 rounded-md text-2xl font-bold text-white',
          className
        )}
      >
        {children}
      </section>
    );
  };

  return (
    <>
      {showExitDialog && <ExitOption />}
      {gameStatus == GameStatus.GAME_ENDED && <EndScreen />}
      {gameStatus != GameStatus.GAME_ENDED && !showExitDialog && (
        <>
          <section className="fixed w-full flex gap-8 justify-center top-4">
            <ContentPanel className="bg-slate-800 bg-opacity-80">
              <PanelLabel iconClass="text-white-400 py-1" icon={<FloorIcon />}>
                Floor {currentLevel}
              </PanelLabel>
            </ContentPanel>
            <ContentPanel className="bg-slate-800 bg-opacity-80">
              <PanelLabel iconClass="text-yellow-400 py-1" icon={<CoinIcon />}>
                {score}
              </PanelLabel>
            </ContentPanel>
          </section>
          <section className="fixed w-full flex justify-center bottom-28">
            {isTired && (
              <span className="text-3xl bg-opacity-60 p-3 bg-slate-700 text-red-400 font-bold">
                HUNGRY
              </span>
            )}
          </section>
          <section className="fixed w-full flex gap-8 justify-center bottom-4">
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <PanelLabel
                iconClass="text-yellow-300 py-1"
                icon={<EnergyIcon />}
              >
                {energy}
              </PanelLabel>
            </ContentPanel>
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <PanelLabel iconClass="text-red-600 py-1" icon={<HeartIcon />}>
                {health}/{maxHealth}
              </PanelLabel>
            </ContentPanel>
          </section>
        </>
      )}
    </>
  );
};
