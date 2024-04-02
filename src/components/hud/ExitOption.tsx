import { cn } from '@/utils/classnames';
import { useMemo } from 'react';
import { FaArrowLeft, FaCartPlus } from 'react-icons/fa';
import { FaStairs } from 'react-icons/fa6';
import { GiExitDoor } from 'react-icons/gi';
import Button from '../input/Button';
import {
  EXIT_EXIT,
  EXIT_GREED,
  EXIT_NEED,
  SHOW_STORE,
} from '../types/EventTypes';
import useGame from '../useGame';
import { ContentPanel, ShowCurrentCurrency, ShowCurrentScore } from './GameHud';

export const ExitOption = () => {
  const { publish } = useGame();
  const enum ExitOptionsEnum {
    NEED,
    GREED,
    STORE,
    RETURN,
  }
  const exitOptions = useMemo(
    () => [
      {
        exitType: ExitOptionsEnum.NEED,
        colorStyles: 'bg-red-800 hover:bg-red-600',
        description: 'You have what you need. Your adventure ends.',
        subDescription: 'Exit the run. Record your gold.',
        buttonLabel: 'NEED',
        buttonLeftIcon: <GiExitDoor />,
        onClick: () => publish(EXIT_NEED),
      },
      {
        exitType: ExitOptionsEnum.GREED,
        colorStyles: 'bg-green-800 hover:bg-green-600',
        description: 'You could always go a little higher.',
        subDescription: 'Go to the next floor.',
        buttonLabel: 'GREED',
        buttonLeftIcon: <FaStairs />,
        onClick: () => publish(EXIT_GREED),
      },
      {
        exitType: ExitOptionsEnum.STORE,
        colorStyles: 'bg-slate-400 hover:bg-slate-500',
        description: 'Spend your gems and upgrade your character',
        subDescription: 'Upgrades only work for this run',
        buttonLabel: 'STORE',
        buttonLeftIcon: <FaCartPlus />,
        onClick: () => publish(SHOW_STORE),
      },
      {
        exitType: ExitOptionsEnum.RETURN,
        styles: 'bg-purple-500 hover:bg-purple-600',
        subDescription: 'Continue to explore this floor',
        buttonLabel: 'RETURN',
        buttonLeftIcon: <FaArrowLeft />,
        onClick: () => publish(EXIT_EXIT),
      },
    ],
    [
      ExitOptionsEnum.GREED,
      ExitOptionsEnum.NEED,
      ExitOptionsEnum.RETURN,
      ExitOptionsEnum.STORE,
      publish,
    ]
  );

  return (
    <section className="fixed top-0 w-full items-stretch h-screen">
      <section className="bg-slate-700 bg-opacity-70 m-5 p-5 flex flex-col gap-5 justify-center items-center min-h-[100svh]">
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl font-bold text-white">
            You currently have:
          </span>
          <div className="flex flex-row items-center gap-2">
            <ContentPanel className="bg-slate-800">
              <ShowCurrentCurrency />
            </ContentPanel>
            <ContentPanel className="bg-slate-800">
              <ShowCurrentScore />
            </ContentPanel>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 w-full md:w-3/4">
          {exitOptions.map((exitOption) => {
            return (
              <div
                key={`exit-option-${exitOption.buttonLabel}`}
                className="flex flex-col col-span-1 gap-1 items-center bg-slate-950 bg-opacity-40 p-2 rounded-md"
              >
                <Button
                  className={cn(
                    exitOption.colorStyles,
                    'w-full p-4 text-xl text-2xl'
                  )}
                  onClick={exitOption.onClick}
                >
                  <div className="flex flex-row md:flex-col items-center gap-2">
                    <span className="text-xl md:text-6xl">
                      {exitOption.buttonLeftIcon}
                    </span>
                    {exitOption.buttonLabel}
                  </div>
                </Button>
                <div className="flex flex-col gap-1 text-white">
                  <span className="text-lg font-bold text-center">
                    {exitOption.description}
                  </span>
                  <span className="text-md text-center">
                    ({exitOption.subDescription ?? ''})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </section>
  );
};
