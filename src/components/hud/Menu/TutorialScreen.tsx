import Button from '@/components/input/Button';
import { ProvisionData, StatusEffectData } from '@/components/types/GameData';
import {
  StatusEffectDataInfo,
  StatusEffectType,
} from '@/components/types/GameTypes';
import { cn } from '@/utils/classnames';
import { getProvisionDescription } from '@/utils/descriptionUtils';
import { clamp } from '@/utils/numberUtils';
import Image from 'next/image';
import { useState } from 'react';
import useMainMenuContext from '../useMainMenuContext';
import { ShowDataCard } from './Tutorial/ShowDataCard';
import { ShowIconData } from './Tutorial/ShowIconData';
import { TutorialHeader } from './Tutorial/TutorialHeader';

type EnemyDataType = {
  icon: string;
  name: string;
  description: string;
};

type HazardDataType = {
  icon: string;
  name: string;
  description: string;
};

const TutorialScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { popScreen } = useMainMenuContext();
  const maxPage = 7;

  const advancePage = () => {
    const nextPage = clamp(currentPage + 1, 1, maxPage);
    setCurrentPage(nextPage);
  };

  const decreasePage = () => {
    const prevPage = clamp(currentPage - 1, 1, maxPage);
    setCurrentPage(prevPage);
  };

  const overviewPage = () => {
    return (
      <div className="text-white text-md md:text-lg">
        <TutorialHeader title="Objective" />
        <p>
          Leave the dungeon with all of your treasures without losing your life
          in the tower.
        </p>
        <TutorialHeader title="Controls and Movement" />
        <p>MOVE with WASD, WAIT a turn with SPACEBAR</p>
        <p>
          If on mobile, you can use the thimble at the bottom of the screen to
          move. Drag and release on a direction to move your hero that way. Tap
          on the middle thimble to wait.
        </p>
        <p>
          Moving one space consumes 1 Energy. When your energy runs out, enemies
          move twice as fast.
        </p>
        <TutorialHeader title="Enemy Movement" />
        <p>
          When you move, enemies move. Every turn enemies will display their
          intended movement plan on the ground. If you&apos;re standing in one
          of the spaces when they&apos;re attempting to move you&apos;ll take
          damage.
        </p>
        <TutorialHeader title="Damage" />
        <p>
          You start off the game with 2 health. Being touched by enemies, or
          standing on an activated trap will cause damage. Once you run out of
          health, your run is over.
        </p>
        <p>
          If you have any weapons, you can walk into an enemy to attack them.
        </p>
        <TutorialHeader title="Opening Chests" />
        <div className="flex flex-row gap-2">
          <div className="relative w-[200px] h-[200px] basis-1/3">
            <Image
              src="/tutorial/ChestExample.png"
              className="rounded-md shadow-lg shrink-0 "
              layout="fill"
              objectFit="cover"
              objectPosition="center"
              alt={'Player next to chest'}
            />
          </div>
          <div className="basis-2/3">
            <p>
              When you are next to a treasure chest and you have a key, you can
              use the WAIT action to unlock the closest chest to you.
            </p>
            <p>
              If you are surrounded by more than one chest, you attempt to open
              them one at a time starting NORTH and in a clockwise direction.
            </p>
          </div>
        </div>
      </div>
    );
  };

  const overviewPageTwo = () => {
    return (
      <div className="text-white text-md md:text-lg">
        <TutorialHeader title="Exiting and Scoring" />
        <p>
          Each dungeon floor has exit stairs leading to the next floor. Reach
          the stairs and decide if you want to continue to climb or leave.
        </p>
        <p>
          <strong className="text-red-400">GREED: </strong>Continue further up
          the dungeon. Each floor is more deadly as enemies get numerous and the
          map gets larger.
        </p>
        <p>
          <strong className="text-green-400">NEED: </strong>Leave the dungeon
          with your current score. This score is saved to the high score tables
          for the daily or adventure game types.
        </p>
        <p>
          <strong className="text-slate-400">STORE: </strong>Spend diamonds you
          find in the dungeon in the store to upgrade your health, stamina, and
          amount of weapons for that run. Or you can sell your diamonds for more
          score.
        </p>
        <TutorialHeader title="Floor Timer" />
        <p>
          Some floors have a round timer that will tick down for every step you
          take. Take too long on a floor, and enemies will start spawning on the
          map every couple of steps.
        </p>
        <TutorialHeader title="Death" />
        <p>If you die, your score will not save to the leaderboards.</p>
      </div>
    );
  };

  const itemsPage = () => {
    return (
      <>
        <ShowIconData grouping="treasure" title="Treasures" />
        <ShowIconData grouping="tool" title="Tools" />
        <ShowIconData grouping="potion" title="Potions" />
        <ShowIconData grouping="food" title="Foodstuffs" />
      </>
    );
  };

  const enemyPageTwo = () => {
    const hazardData: HazardDataType[] = [
      {
        icon: 'WaterIcon.png',
        name: 'Water',
        description: 'Adds SLOW for as long as you are in this liquid',
      },
      {
        icon: 'PoisonIcon.png',
        name: 'Poison',
        description:
          'Adds 3 POISON stacks for each turn you are in this liquid',
      },
      {
        icon: 'MudIcon.png',
        name: 'Mud',
        description: 'Adds 3 SLOW stacks for each turn you are in this liquid',
      },
      {
        icon: 'LavaIcon.png',
        name: 'Lava',
        description: 'Deals 1 damage for each turn you are in this liquid',
      },
    ];

    const trapData: HazardDataType[] = [
      {
        icon: 'SpikeTrapIcon.png',
        name: 'Spike Trap',
        description: 'Triggers every 3 turns. Deals 1 damage.',
      },
      {
        icon: 'ArrowTrapIcon.png',
        name: 'Arrow Trap',
        description: 'Triggers every 5 turns. Deals 1 damage.',
      },
      {
        icon: 'GasTrapIcon.png',
        name: 'Gas Trap',
        description:
          'Triggers every 6 turns. Spawns gas that gives status effects.',
      },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {hazardData.map((data) => (
            <ShowDataCard
              key={`hazarddata-${data.name}`}
              iconPath={`/images/icons/${data.icon}`}
              name={data.name}
              description={data.description}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {trapData.map((data) => (
            <ShowDataCard
              key={`trapData-${data.name}`}
              iconPath={`/images/icons/${data.icon}`}
              name={data.name}
              description={data.description}
            />
          ))}
        </div>
      </>
    );
  };

  const enemyPageOne = () => {
    const enemyData: EnemyDataType[] = [
      {
        icon: 'OrcIcon.png',
        name: 'Orcman',
        description:
          'Always moves two spaces randomly. Can open doors to rooms.',
      },
      {
        icon: 'SkeletonIcon.png',
        name: 'Skelebruh',
        description: 'Moves 0-2 spaces randomly.',
      },
      {
        icon: 'GhostIcon.png',
        name: 'Ghoulie',
        description: 'Moves 0-3 spaces randomly. Can move through walls.',
      },
      {
        icon: 'NoodleIcon.png',
        name: 'Noodle',
        description:
          'Moves 0-3 spaces randomly. Deals 1 damage and adds POISON status.',
      },
      {
        icon: 'ConfusionGasIcon.png',
        name: 'Confusion Gas',
        description:
          'Moves 1 spaces randomly. Gives CONFUSION status on contact. Fades after 5 turns.',
      },
      {
        icon: 'PoisonGasIcon.png',
        name: 'Poison Gas',
        description:
          'Moves 1 spaces randomly. Gives POISON status on contact. Fades after 5 turns.',
      },
    ];

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {enemyData.map((data) => (
            <ShowDataCard
              key={`enemydata-${data.name}`}
              iconPath={`/images/icons/${data.icon}`}
              name={data.name}
              description={data.description}
            />
          ))}
        </div>
      </>
    );
  };

  const ProvisionsPage = () => {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          {ProvisionData.map((data) => {
            const provDescription = getProvisionDescription(data);
            return (
              <ShowDataCard
                key={`enemydata-${data.name}`}
                iconPath=""
                placeholder
                width={256}
                height={256}
                name={data.name}
                description={provDescription}
              />
            );
          })}
        </div>
      </>
    );
  };

  const StatusEffectPage = () => {
    const ShowEffectDescription = ({
      data,
    }: {
      data: StatusEffectDataInfo;
    }) => {
      return (
        <div className="flex flex-row gap-2 flex-nowrap text-white items-center">
          <span
            className={cn(
              'bg-slate-900 rounded-md p-2',
              'text-xl font-bold uppercase',
              data.cssStyles
            )}
          >
            {data.name}
          </span>
          <div>{data.description}</div>
        </div>
      );
    };

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {StatusEffectData.map((data) => {
            if (
              ![StatusEffectType.NONE, StatusEffectType.CONFUSION].includes(
                data.statusEffectType
              )
            ) {
              return (
                <ShowEffectDescription
                  key={`effect-${data.name}`}
                  data={data}
                />
              );
            }
          })}
        </div>
      </>
    );
  };

  const DisplayPage = ({ page }: { page: number }) => {
    const pages = [
      { pageNumber: 1, pageTitle: 'Overview', element: overviewPage },
      { pageNumber: 2, pageTitle: 'Overview II', element: overviewPageTwo },
      { pageNumber: 3, pageTitle: 'Items', element: itemsPage },
      { pageNumber: 4, pageTitle: 'Status Effects', element: StatusEffectPage },
      { pageNumber: 5, pageTitle: 'Enemies', element: enemyPageOne },
      { pageNumber: 6, pageTitle: 'Traps & Hazards', element: enemyPageTwo },
      { pageNumber: 7, pageTitle: 'Provisions', element: ProvisionsPage },
    ];

    const pageContent = pages.find((pg) => pg.pageNumber === page);
    if (!pageContent) {
      return <></>;
    }

    return (
      <>
        <h2 className="text-slate-200 text-xl font-bold text-center pb-2">
          {pageContent.pageTitle} {`(${page}/${maxPage})`}
        </h2>
        <div className=" overflow-y-scroll pr-2 md:pr-4">
          {pageContent.element()}
        </div>
      </>
    );
  };

  const buttonClassStyle = 'text-sm p-2 sm:text-base sm:p-4';

  return (
    <div className="h-full w-full md:w-2/3 flex flex-col">
      <h1 className="text-white text-2xl font-bold text-center">Tutorial</h1>
      <DisplayPage page={currentPage} />
      <div className="flex-auto"></div>
      <div className="flex flex-row justify-between gap-7 mt-3 md:mt-5">
        <Button
          variant="secondary"
          type="submit"
          disabled={currentPage === 1}
          onClick={() => decreasePage()}
          className={buttonClassStyle}
        >
          &larr; Prev
        </Button>
        <Button
          variant="danger"
          type="submit"
          onClick={() => popScreen()}
          className={buttonClassStyle}
        >
          Back to Menu
        </Button>
        <Button
          variant="secondary"
          disabled={currentPage === maxPage}
          type="submit"
          onClick={() => advancePage()}
          className={buttonClassStyle}
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
};

export default TutorialScreen;
