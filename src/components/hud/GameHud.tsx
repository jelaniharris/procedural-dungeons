import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import React, { useCallback } from 'react';
import {
  FaClock as ClockIcon,
  FaCoins as CoinIcon,
  FaGem as DiamondIcon,
  FaBolt as EnergyIcon,
  FaLayerGroup as FloorIcon,
  FaHeart as HeartIcon,
  FaCog as SettingsIcon,
  FaSkull as SkullIcon,
} from 'react-icons/fa';
import { GiPlainDagger as AttacksIcon } from 'react-icons/gi';
import Button from '../input/Button';
import { GameStatus, StatusEffectType } from '../types/GameTypes';
import { EndScreen } from './EndScreen';
import { ExitOption } from './ExitOption';
import { SettingsScreen } from './SettingsScreen';

export const GameHud = () => {
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const score = useStore((store: GameState) => store.score);
  const energy = useStore((store: GameState) => store.energy);
  const health = useStore((store: GameState) => store.health);
  const currency = useStore((store: GameState) => store.currency);
  const getMaxHealth = useStore((store: GameState) => store.getMaxHealth);
  const attacks = useStore((store: GameState) => store.attacks);
  const maxAttacks = useStore((store: GameState) => store.maxAttacks);
  const maxEnergy = useStore((store: GameState) => store.maxEnergy);
  const showExitDialog = useStore((store: GameState) => store.showExitDialog);
  const setGameStatus = useStore((store: GameState) => store.setGameStatus);
  const hasStatusEffect = useStore((store: GameState) => store.hasStatusEffect);
  const showSettingsDialog = useStore(
    (store: GameState) => store.showSettingsDialog
  );
  const setShowSettingsDialog = useStore(
    (store: GameState) => store.setShowSettingsDialog
  );
  const gameStatus = useStore((store: GameState) => store.gameStatus);
  const floorSteps = useStore((store: GameState) => store.floorSteps);

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
        className={cn(
          ' bg-slate-700 bg-opacity-60 p-2 rounded-md text-2xl font-bold text-white',
          className
        )}
      >
        {children}
      </section>
    );
  };

  const showSettings = useCallback(() => {
    setShowSettingsDialog(true);
    setGameStatus(GameStatus.GAME_MENU);
  }, [setGameStatus, setShowSettingsDialog]);

  const backToGame = useCallback(() => {
    setShowSettingsDialog(false);
    setGameStatus(GameStatus.GAME_STARTED);
  }, [setGameStatus, setShowSettingsDialog]);

  if (showSettingsDialog) {
    return (
      <>
        <SettingsScreen
          backToMenuCallback={backToGame}
          backToMenuText={'Back To Game'}
        />
      </>
    );
  }

  const isTired = hasStatusEffect(StatusEffectType.STARVING) !== undefined;

  return (
    <>
      {showExitDialog && <ExitOption />}
      {gameStatus == GameStatus.GAME_ENDED && <EndScreen />}
      {gameStatus != GameStatus.GAME_ENDED && !showExitDialog && (
        <>
          <section className="fixed w-full flex gap-8 justify-between top-2">
            <div></div>
            <div className="flex gap-8">
              {' '}
              <ContentPanel className="bg-slate-800 bg-opacity-80">
                <PanelLabel
                  iconClass="text-white-400 py-1"
                  icon={<FloorIcon />}
                >
                  <span className="hidden md:inline">Floor</span> {currentLevel}
                </PanelLabel>
              </ContentPanel>
              <ContentPanel className="bg-slate-800 bg-opacity-80">
                <PanelLabel
                  iconClass="text-white-400 py-1"
                  icon={floorSteps > 0 ? <ClockIcon /> : <SkullIcon />}
                >
                  {floorSteps > 0 ? floorSteps : '!!'}
                </PanelLabel>
              </ContentPanel>
              <ContentPanel className="bg-slate-800 bg-opacity-80">
                <PanelLabel
                  iconClass="text-yellow-400 py-1"
                  icon={<CoinIcon />}
                >
                  {score}
                </PanelLabel>
              </ContentPanel>
            </div>
            <div className="mr-5">
              <Button
                className="bg-slate-800 hover:bg-slate-600"
                onClick={showSettings}
              >
                <SettingsIcon />
              </Button>
            </div>
          </section>
          <section className="fixed w-full flex gap-8 justify-between top-16">
            <div></div>
            <div>
              {currency > 0 && (
                <ContentPanel className="bg-slate-600 bg-opacity-80">
                  <PanelLabel
                    iconClass="text-slate-200 py-1"
                    icon={<DiamondIcon />}
                  >
                    {currency}
                  </PanelLabel>
                </ContentPanel>
              )}
            </div>
            <div></div>
          </section>
          <section className="fixed w-full flex justify-center bottom-20 ">
            {isTired && (
              <span className="text-3xl bg-opacity-60 px-3 py-1 rounded bg-slate-700 text-red-400 font-bold">
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
                {energy}/{maxEnergy}
              </PanelLabel>
            </ContentPanel>
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <PanelLabel iconClass="text-red-600 py-1" icon={<HeartIcon />}>
                {health}/{getMaxHealth()}
              </PanelLabel>
            </ContentPanel>
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <PanelLabel
                iconClass="text-slate-300 py-1"
                icon={<AttacksIcon />}
              >
                {attacks}/{maxAttacks}
              </PanelLabel>
            </ContentPanel>
          </section>
        </>
      )}
    </>
  );
};
