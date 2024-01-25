import { FaCartPlus } from 'react-icons/fa';
import { FaStairs } from 'react-icons/fa6';
import { GiExitDoor } from 'react-icons/gi';
import Button from '../input/Button';
import { EXIT_GREED, EXIT_NEED, SHOW_STORE } from '../types/EventTypes';
import useGame from '../useGame';
import { ContentPanel, ShowCurrentCurrency, ShowCurrentScore } from './GameHud';

export const ExitOption = () => {
  const { publish } = useGame();

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full md:w-3/4">
          <div className="flex flex-col col-span-1 gap-3 items-center">
            <Button
              className="bg-red-800 hover:bg-red-600 w-full p-4 text-2xl"
              onClick={() => publish(EXIT_NEED)}
              leftIcon={<GiExitDoor />}
            >
              NEED
            </Button>
            <span className="text-xl font-bold text-white">
              You have what you need. Your adventure ends.
            </span>
            <span className="text-md text-white">
              (Exit the run. Record your gold.)
            </span>
          </div>
          <div className="flex flex-col gap-3 items-center col-span-1 ">
            <Button
              className="bg-green-800 hover:bg-green-600 w-full p-4 text-2xl"
              onClick={() => publish(EXIT_GREED)}
              leftIcon={<FaStairs />}
            >
              GREED
            </Button>
            <span className="text-xl font-bold text-white">
              You could always go a little higher.
            </span>
            <span className="text-md text-white">(Go to the next floor)</span>
          </div>
          <div className="flex flex-col gap-3 items-center py-0 md:py-10 col-span-1 md:col-span-2">
            <Button
              className="bg-slate-400 hover:bg-slate-500 w-full p-4 text-2xl"
              leftIcon={<FaCartPlus />}
              onClick={() => publish(SHOW_STORE)}
            >
              STORE
            </Button>
            <div className="flex flex-row items-center gap-1">
              <span className="text-xl font-bold text-white">
                Spend your gems and upgrade your character.{' '}
              </span>
            </div>
            <span className="text-md text-white">
              (Only lasts for this run.)
            </span>
          </div>
        </div>
      </section>
    </section>
  );
};
