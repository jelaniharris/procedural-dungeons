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
  const maxPage = 3;

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
        <p>Move with WASD, wait a turn with SPACEBAR</p>
        <p>When you move, enemies move.</p>
        <p>Reach the exit decide if you want to continue or leave</p>
        <p>If you die, your score will not save</p>
      </div>
    );
  };

  const itemsPage = () => {
    const itemData: IconsDataType[] = [
      { icon: 'CoinIcon.png', name: 'Coin', description: 'Gives 10 Gold' },
      {
        icon: 'ChaliceIcon.png',
        name: 'Chalice',
        description: 'Gives 25 Gold',
      },
      { icon: 'CrownIcon.png', name: 'Crown', description: 'Gives 150 Gold' },
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
        <div className="grid grid-cols-2 gap-4">
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
        name: 'Orc',
        description: 'Always moves two spaces',
      },
      {
        icon: 'SkeletonIcon.png',
        name: 'Skeleton',
        description: 'Moves 0-2 spaces.',
      },
      {
        icon: 'GhostIcon.png',
        name: 'Ghost',
        description: 'Moves 0-3 spaces. Can move through walls.',
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
        <div className="grid grid-cols-2 gap-4">
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
      { pageNumber: 2, pageTitle: 'Items', element: itemsPage },
      { pageNumber: 3, pageTitle: 'Enemies', element: enemyPage },
    ];

    const pageContent = pages.find((pg) => pg.pageNumber === page);
    if (!pageContent) {
      return <></>;
    }

    return (
      <>
        <h2 className="text-white text-xl font-bold">
          {pageContent.pageTitle} {`(${page}/${maxPage})`}
        </h2>
        {pageContent.element()}
      </>
    );
  };

  return (
    <>
      <h1 className="text-white text-2xl font-bold">Tutorial</h1>
      <DisplayPage page={currentPage} />
      <div className="flex-auto"></div>
      <div className="flex flex-row justify-evenly gap-7">
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
    </>
  );
};

export default TutorialScreen;
