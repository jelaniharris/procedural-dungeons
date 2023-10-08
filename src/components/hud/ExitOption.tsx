import { GameState, useStore } from '@/stores/useStore';
import useGame from '../useGame';
import { EXIT_GREED, EXIT_NEED } from '../types/EventTypes';

export const ExitOption = () => {
  const score = useStore((store: GameState) => store.score);
  const { publish } = useGame();

  return (
    <section className="fixed top-0 w-full items-stretch h-screen">
      <section className="bg-slate-700 bg-opacity-70 m-5 p-5 flex flex-col gap-5 justify-center items-center min-h-[100svh]">
        <span className="text-2xl font-bold text-white">
          You currently have {score} gold.{' '}
        </span>

        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="flex flex-col gap-3 items-center col-span-2 md:col-span-1">
            <button
              className="bg-red-800 hover:bg-red-600 text-white w-full rounded-lg font-bold p-4 text-2xl"
              onClick={() => publish(EXIT_NEED)}
            >
              NEED
            </button>
            <span className="text-xl font-bold text-white">
              You have what you need. Your adventure ends.
            </span>
            <span className="text-md text-white">
              (Exit the run. Record your gold.)
            </span>
          </div>
          <div className="flex flex-col gap-3 items-center col-span-2 md:col-span-1">
            <button
              className="bg-green-800 hover:bg-green-600 text-white w-full rounded-lg font-bold p-4 text-2xl"
              onClick={() => publish(EXIT_GREED)}
            >
              GREED
            </button>
            <span className="text-xl font-bold text-white">
              You could always go a little higher.
            </span>
            <span className="text-md text-white">(Go to the next floor)</span>
          </div>
        </div>
      </section>
    </section>
  );
};
