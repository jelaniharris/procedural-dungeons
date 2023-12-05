import Button from '@/components/input/Button';
import { clamp } from '@/utils/numberUtils';
import Image from 'next/image';
import { useState } from 'react';
import useMainMenuContext from '../useMainMenuContext';

type IconsDataType = {
  icon: string;
  name: string;
  description: string;
};

type EnemyDataType = {
  icon: string;
  name: string;
  description: string;
};

const TutorialScreen = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { popScreen } = useMainMenuContext();
  const maxPage = 4;

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
      <div className="text-white text-lg">
        <h2 className="text-xl font-bold pb-2">Controls and Movement</h2>
        <p>Move with WASD, wait a turn with SPACEBAR</p>
        <p>
          If on mobile, you can use the thimble in the middle to move. Drag and
          release on a direction to move that way. Tap on the middle thimble to
          wait.
        </p>
        <p>
          Moving one space consumes 1 Energy. When your energy runs out, enemies
          move twice as fast.
        </p>
        <h2 className="text-xl font-bold py-2">Enemy Movement</h2>
        <p>
          When you move, enemies move. Every turn enemies will display their
          intended movement plan on the ground. If you&apos;re standing in one
          of the spaces when they&apos;re attempting to move you&apos;ll take
          damage.
        </p>
        <h2 className="text-xl font-bold py-2">Damage</h2>
        <p>
          You start off the game with 2 health. Being touched by enemies, or
          standing on an activated trap will cause damage. Once you run out of
          health, your run is over.
        </p>
        <p>
          If you have any weapons, you can walk into an enemy to attack them.
        </p>
      </div>
    );
  };

  const overviewPageTwo = () => {
    return (
      <div className="text-white text-lg">
        <h2 className="text-xl font-bold pb-2">Exiting and Scoring</h2>
        <p>
          Each dungeon floor has exit stairs. Reach the stairs and decide if you
          want to continue or leave.
        </p>
        <p>
          <strong className="text-red-400">GREED: </strong>Continue further up
          in the dungeon, where the enemies get numerous and the map gets
          larger.
        </p>
        <p>
          <strong className="text-green-400">NEED: </strong>Leave the dungeon
          with your current score. This score is saved to the high score tables
          for the daily or adventure game types.
        </p>
        <p>If you die, your score will not save</p>
      </div>
    );
  };

  const itemsPage = () => {
    const itemData: IconsDataType[] = [
      { icon: 'CoinIcon.png', name: 'Coin', description: 'Worth 10 Gold' },
      {
        icon: 'ChaliceIcon.png',
        name: 'Chalice',
        description: 'Worth 25 Gold',
      },
      { icon: 'CrownIcon.png', name: 'Crown', description: 'Worth 150 Gold' },
      { icon: 'DaggerIcon.png', name: 'Dagger', description: 'Gives 1 Weapon' },
      { icon: 'PotionIcon.png', name: 'Potion', description: 'Gives 1 Health' },
      {
        icon: 'ChickenIcon.png',
        name: 'Chicken',
        description: 'Gives 30 Energy',
      },
    ];

    const ShowData = ({ data }: { data: IconsDataType }) => {
      return (
        <div className="flex flex-row gap-3 bg-slate-500 rounded-sm p-3 text-white">
          <Image
            src={`/images/icons/${data.icon}`}
            className="border border-slate-400"
            width={70}
            height={70}
            alt={data.name}
          />
          <div className="flex flex-col gap-1">
            <strong>{data.name}</strong>
            {data.description}
          </div>
        </div>
      );
    };

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {itemData.map((data) => (
            <ShowData key={`itemdata-${data.name}`} data={data} />
          ))}
        </div>
      </>
    );
  };

  const enemyPage = () => {
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
    ];

    const ShowData = ({ data }: { data: IconsDataType }) => {
      return (
        <div className="flex flex-row gap-3 bg-slate-500 rounded-sm p-3 text-white">
          <Image
            src={`/images/icons/${data.icon}`}
            className="border border-slate-400"
            width={100}
            height={100}
            alt={data.name}
          />
          <div className="flex flex-col gap-1">
            <strong>{data.name}</strong>
            {data.description}
          </div>
        </div>
      );
    };

    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enemyData.map((data) => (
            <ShowData key={`enemydata-${data.name}`} data={data} />
          ))}
        </div>
      </>
    );
  };

  const DisplayPage = ({ page }: { page: number }) => {
    const pages = [
      { pageNumber: 1, pageTitle: 'Overview', element: overviewPage },
      { pageNumber: 2, pageTitle: 'Overview II', element: overviewPageTwo },
      { pageNumber: 3, pageTitle: 'Items', element: itemsPage },
      { pageNumber: 4, pageTitle: 'Enemies', element: enemyPage },
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
        {pageContent.element()}
      </>
    );
  };

  return (
    <div className="h-full w-full md:w-2/3 flex flex-col">
      <h1 className="text-white text-2xl font-bold text-center">Tutorial</h1>
      <DisplayPage page={currentPage} />
      <div className="flex-auto"></div>
      <div className="flex flex-row justify-between gap-7">
        <Button
          variant="secondary"
          type="submit"
          disabled={currentPage === 1}
          onClick={() => decreasePage()}
        >
          &larr; Prev
        </Button>
        <Button variant="danger" type="submit" onClick={() => popScreen()}>
          Back to Menu
        </Button>
        <Button
          variant="secondary"
          disabled={currentPage === maxPage}
          type="submit"
          onClick={() => advancePage()}
        >
          Next &rarr;
        </Button>
      </div>
    </div>
  );
};

export default TutorialScreen;
