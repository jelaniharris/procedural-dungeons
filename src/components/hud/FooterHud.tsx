import { GameState, useStore } from '@/stores/useStore';
import { FaBolt as EnergyIcon, FaHeart as HeartIcon } from 'react-icons/fa';
import { EndScreen } from './EndScreen';
import { ExitOption } from './ExitOption';
import { GameStatus } from '../types/GameTypes';

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

  return (
    <>
      {showExitDialog && <ExitOption />}
      {gameStatus == GameStatus.GAME_ENDED && <EndScreen />}
      {gameStatus != GameStatus.GAME_ENDED && !showExitDialog && (
        <>
          <section className="fixed w-full flex gap-8 justify-center top-4">
            <section className=" bg-slate-700 bg-opacity-60 p-4 text-2xl font-bold text-white">
              Score: {score}
            </section>
            <section className=" bg-slate-700 bg-opacity-60 p-4 text-2xl font-bold text-white">
              Level: {currentLevel}
            </section>
          </section>
          <section className="fixed w-full flex justify-center bottom-28">
            {isTired && (
              <span className="text-3xl bg-opacity-60 p-3 bg-slate-700 text-red-400 font-bold">
                HUNGRY
              </span>
            )}
          </section>
          <section className="fixed w-full flex gap-8 justify-center bottom-4">
            <section className=" bg-slate-700 bg-opacity-60 p-4 flex justify-center items-center flex-nowrap ">
              <PanelLabel
                iconClass="text-yellow-300 py-1"
                icon={<EnergyIcon />}
              >
                {energy}
              </PanelLabel>
            </section>
            <section className=" bg-slate-700 bg-opacity-60 p-4 flex justify-center items-center flex-nowrap ">
              <PanelLabel iconClass="text-red-600 py-1" icon={<HeartIcon />}>
                {health}/{maxHealth}
              </PanelLabel>
            </section>
          </section>
        </>
      )}
    </>
  );
};
