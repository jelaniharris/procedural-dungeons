import { GameState, useStore } from '@/stores/useStore';
import { findProvisionData } from '@/utils/ProvisionUtils';
import React, { Dispatch, SetStateAction, useContext, useState } from 'react';
import Button from '../../input/Button';
import { CHANGE_SCENE } from '../../types/EventTypes';
import { ProvisionType } from '../../types/GameTypes';
import useGame from '../../useGame';
import { ProvisionSelector } from './ProvisionSelector';

export interface EmbarkContextValue {
  selected: ProvisionType | null;
  setSelected: Dispatch<SetStateAction<ProvisionType | null>>;
}

export const EmbarkContext = React.createContext<EmbarkContextValue | null>(
  null
);

export default function useEmbark() {
  return useContext(EmbarkContext) as EmbarkContextValue;
}

export const EmbarkScreen = () => {
  //const [playerData, setPlayerData] = useState<PlayerLocalData | null>(null);
  const addProvision = useStore((store: GameState) => store.addProvision);
  const resetProvisions = useStore((store: GameState) => store.resetProvisions);
  const { setCurrentHud, publish } = useGame();
  const [selected, setSelected] = useState<ProvisionType | null>(null);

  const embarkGame = () => {
    setCurrentHud('game');
    resetProvisions();
    if (selected) {
      const foundProvision = findProvisionData(selected);
      if (foundProvision) {
        addProvision(foundProvision);
      }
    }
    publish(CHANGE_SCENE, { nextScene: 'dungeon' });
  };

  const backToMainMenu = () => {
    setCurrentHud('mainmenu');
    publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  const contextValue: EmbarkContextValue = {
    selected,
    setSelected,
  };

  return (
    <EmbarkContext.Provider value={contextValue}>
      <section className="fixed top-0 z-10 w-full h-full items-stretch">
        <div className="flex flex-col items-center justify-center p-5 h-full gap-5 bg-slate-700 bg-opacity-60">
          <div className="flex-auto"></div>
          <h1 className="text-white font-bold text-center text-2xl">
            Select Provision
          </h1>
          <ProvisionSelector />
          <div className="flex-auto"></div>
          <div className="flex flex-col gap-3">
            <Button
              disabled={selected === null}
              onClick={embarkGame}
              className="text-2xl md:text-5xl"
            >
              Embark
            </Button>
            <Button variant="danger" onClick={backToMainMenu}>
              Back to Menu
            </Button>
          </div>
        </div>
      </section>
    </EmbarkContext.Provider>
  );
};
