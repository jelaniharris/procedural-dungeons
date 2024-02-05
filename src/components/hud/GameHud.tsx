import { GameState, useStore } from '@/stores/useStore';
import { cn } from '@/utils/classnames';
import React, { useCallback, useMemo } from 'react';
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
import { shallow } from 'zustand/shallow';
import Button from '../input/Button';
import { StatusEffectData } from '../types/GameData';
import { GameStatus, StatusEffectType } from '../types/GameTypes';
import { EndScreen } from './EndScreen';
import { ExitOption } from './ExitOption';
import { SettingsScreen } from './SettingsScreen';
import { StoreScreen } from './StoreScreen';

export const PanelLabel = ({
  icon,
  iconClass = '',
  children,
}: {
  icon: React.ReactNode;
  iconClass?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="text-2xl font-bold flex gap-2">
      <span className={iconClass}>{icon}</span>
      {children && <span className="text-white">{children}</span>}
    </div>
  );
};

export const ContentPanel = ({
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

export const ShowCurrentCurrency = () => {
  const currency = useStore((store: GameState) => store.currency);
  return (
    <PanelLabel iconClass="text-slate-200 py-1" icon={<DiamondIcon />}>
      {currency}
    </PanelLabel>
  );
};

export const ShowCurrentScore = () => {
  const score = useStore((store: GameState) => store.score);
  return (
    <PanelLabel iconClass="text-yellow-400 py-1" icon={<CoinIcon />}>
      {score}
    </PanelLabel>
  );
};

export const ShowCurrentHealth = ({ showPoisoning = false }) => {
  const health = useStore((store: GameState) => store.health);
  const getMaxHealth = useStore((store: GameState) => store.getMaxHealth);
  const hasStatusEffect = useStore((store: GameState) => store.hasStatusEffect);
  const isPoisoned = hasStatusEffect(StatusEffectType.POISON) !== undefined;

  let heartElements = (
    <PanelLabel iconClass="text-red-600 py-1" icon={<HeartIcon />}>
      {health}/{getMaxHealth()}
    </PanelLabel>
  );

  if (showPoisoning) {
    if (isPoisoned) {
      heartElements = (
        <PanelLabel iconClass="text-green-600 py-1" icon={<HeartIcon />} />
      );
    }
  }

  return heartElements;
};

export const ShowStatusEffect = ({
  statusEffect,
}: {
  statusEffect: StatusEffectType;
}) => {
  const hasStatusEffect = useStore((store: GameState) => store.hasStatusEffect);
  const currentStatusEffect = hasStatusEffect(statusEffect);

  const statusEffectInfo = useMemo(() => {
    return currentStatusEffect
      ? StatusEffectData.find(
          (ef) => ef.statusEffectType === currentStatusEffect.statusEffectType
        )
      : null;
  }, [currentStatusEffect]);

  const statusEffectText = () => {
    if (!statusEffectInfo || !currentStatusEffect) {
      return '';
    }
    let duration = '';
    if (currentStatusEffect.canExpire) {
      duration = `(${currentStatusEffect.duration})`;
    }

    return `${statusEffectInfo.name}${duration}`;
  };

  const statusStyles = {
    background: 'bg-opacity-60 px-3 py-1 rounded bg-slate-700',
    font: 'text-3xl font-bold',
  };

  if (!statusEffectInfo || !currentStatusEffect) {
    return null;
  }

  return (
    <span
      className={cn(
        statusStyles.background,
        statusStyles.font,
        statusEffectInfo.cssStyles,
        'uppercase'
      )}
    >
      {statusEffectText()}
    </span>
  );
};

export const ShowAllStatusEffects = () => {
  const statusEffects = useStore(
    (store: GameState) => store.statusEffects,
    shallow
  );
  console.log('REDNERING ALL STATUS EFFECTS');

  return (
    <div className="flex flex-row gap-2">
      {statusEffects.map((sf) => {
        return (
          <ShowStatusEffect
            key={`statuseffect-${sf.statusEffectType}`}
            statusEffect={sf.statusEffectType}
          />
        );
      })}
    </div>
  );
};

export const GameHud = () => {
  const currentLevel = useStore((store: GameState) => store.currentLevel);
  const energy = useStore((store: GameState) => store.energy);
  const currency = useStore((store: GameState) => store.currency);
  const attacks = useStore((store: GameState) => store.attacks);
  const getMaxAttacks = useStore((store: GameState) => store.getMaxAttacks);
  const getMaxEnergy = useStore((store: GameState) => store.getMaxEnergy);
  const showExitDialog = useStore((store: GameState) => store.showExitDialog);
  const showStoreDialog = useStore((store: GameState) => store.showStoreDialog);
  const setGameStatus = useStore((store: GameState) => store.setGameStatus);
  const showSettingsDialog = useStore(
    (store: GameState) => store.showSettingsDialog
  );
  const setShowSettingsDialog = useStore(
    (store: GameState) => store.setShowSettingsDialog
  );
  const gameStatus = useStore((store: GameState) => store.gameStatus);
  const floorSteps = useStore((store: GameState) => store.floorSteps);

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

  if (showStoreDialog) {
    return (
      <>
        <StoreScreen />
      </>
    );
  }

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
                <ShowCurrentScore />
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
                  <ShowCurrentCurrency />
                </ContentPanel>
              )}
            </div>
            <div></div>
          </section>
          <section className="fixed w-full flex justify-center bottom-20 ">
            <ShowAllStatusEffects />
          </section>
          <section className="fixed w-full flex gap-8 justify-center bottom-4">
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <PanelLabel
                iconClass="text-yellow-300 py-1"
                icon={<EnergyIcon />}
              >
                {energy}/{getMaxEnergy()}
              </PanelLabel>
            </ContentPanel>
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <ShowCurrentHealth showPoisoning />
            </ContentPanel>
            <ContentPanel className="flex justify-center items-center flex-nowrap">
              <PanelLabel
                iconClass="text-slate-300 py-1"
                icon={<AttacksIcon />}
              >
                {attacks}/{getMaxAttacks()}
              </PanelLabel>
            </ContentPanel>
          </section>
        </>
      )}
    </>
  );
};
