import { GameState, useStore } from '@/stores/useStore';
import {
  FaArrowLeft,
  FaBolt,
  FaCoins,
  FaGem,
  FaHeart,
  FaSquare,
} from 'react-icons/fa';
import { LuSword } from 'react-icons/lu';
import { clamp } from 'three/src/math/MathUtils';
import Button from '../input/Button';
import { HIDE_STORE } from '../types/EventTypes';
import { UpgradeData } from '../types/GameData';
import { PlayerUpgradeType } from '../types/GameTypes';
import useGame from '../useGame';
import CenterScreenContainer from './CenterScreen';
import {
  ContentPanel,
  ShowCurrentAttacks,
  ShowCurrentCurrency,
  ShowCurrentEnergy,
  ShowCurrentHealth,
  ShowCurrentScore,
} from './GameHud';

const RankMeter = ({ rank, maxRank }: { rank: number; maxRank: number }) => {
  const pips = [];
  for (let i = 0; i < rank; i++) {
    pips.push(
      <span className="text-blue-500">
        <FaSquare />
      </span>
    );
  }
  for (let i = 0; i < maxRank - rank; i++) {
    pips.push(
      <span className="text-gray-200">
        <FaSquare />
      </span>
    );
  }
  for (let i = 0; i < 5 - maxRank; i++) {
    pips.push(
      <span className="text-gray-800">
        <FaSquare />
      </span>
    );
  }

  return (
    <div className="flex flex-row flex-nowrap text-sm md:text-base">{pips}</div>
  );
};

export const StoreScreen = () => {
  //const upgrades = useStore((store: GameState) => store.upgrades);
  const currency = useStore((store: GameState) => store.currency);
  const getUpgradeRank = useStore((store: GameState) => store.getUpgradeRank);
  const purchaseUpgrade = useStore((store: GameState) => store.purchaseUpgrade);
  //const setGameStatus = useStore((store: GameState) => store.setGameStatus);
  const adjustCurrency = useStore((store: GameState) => store.adjustCurrency);
  const addScore = useStore((store: GameState) => store.addScore);
  const adjustHealth = useStore((store: GameState) => store.adjustHealth);

  const { publish } = useGame();

  const backToFloorMenu = () => {
    //setCurrentHud('mainmenu');
    publish(HIDE_STORE);
    //setShowStoreDialog(false);
    //setGameStatus(GameStatus.GAME_STARTED);
    //publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  const ShowUpgrade = ({ upgradeType }: { upgradeType: PlayerUpgradeType }) => {
    let buttonText = 'Upgrade';
    const data = UpgradeData.find((val) => val.type === upgradeType);
    const rank = getUpgradeRank(upgradeType);
    if (!data) return <></>;
    const currentCost = data.rankCost[rank];

    let purchaseDisabled = false;
    const hasFunds = currency >= currentCost;
    const isMaxed = rank === data.maxRank;

    if (isMaxed) {
      buttonText = 'Maxed';
      purchaseDisabled = true;
    }

    if (!hasFunds) {
      buttonText = 'No Funds';
      purchaseDisabled = true;
    }

    const purchaseRank = () => {
      purchaseUpgrade(upgradeType);
      if (upgradeType === PlayerUpgradeType.UPGRADE_HEALTH) {
        adjustHealth(1);
      }
      adjustCurrency(-currentCost);
    };

    let upgradeIcon: JSX.Element | null = null;
    switch (upgradeType) {
      case PlayerUpgradeType.UPGRADE_HEALTH:
        upgradeIcon = (
          <span className="text-red-500">
            <FaHeart />
          </span>
        );
        break;
      case PlayerUpgradeType.UPGRADE_ENERGY:
        upgradeIcon = (
          <span className="text-yellow-500">
            <FaBolt />
          </span>
        );
        break;
      case PlayerUpgradeType.UPGRADE_WEAPON:
        upgradeIcon = (
          <span className="text-slate-300">
            <LuSword />
          </span>
        );
        break;
    }

    return (
      <div className="grid grid-cols-4 divide-x-2 divide-slate-600 gap-2 items-center justify-between p-1 bg-slate-700 bg-opacity-80 rounded-md">
        <div className="flex flex-col gap-1 p-2">
          <span className="text-xl text-white">{data.name}</span>
          <span>
            <RankMeter rank={rank} maxRank={data.maxRank} />
          </span>
        </div>
        <div className="flex flex-col  text-lg text-white text-center items-center p-2">
          <span className="hidden md:inline-block font-bold">Next:</span>
          {!isMaxed && (
            <div className="flex flex-row gap-1 items-center ">
              <span className="hidden sm:inline-block">{'+ Max'}</span>
              <span className="sm:hidden inline-block">{'+'}</span>
              {data.amountUpgrade[rank] || 0}
              {upgradeIcon}
            </div>
          )}
          {isMaxed && <div>-</div>}
        </div>
        <div className="flex flex-col text-lg  text-center items-center text-white p-2">
          <span className="hidden md:inline-block font-bold">Cost:</span>
          {!isMaxed && (
            <span className="flex flex-row gap-1 items-center">
              {currentCost}
              <FaGem />
            </span>
          )}
          {isMaxed && <span>-</span>}
        </div>
        <div className=" p-2">
          <Button
            variant="primary"
            disabled={purchaseDisabled}
            onClick={purchaseRank}
            className="p-2 md:p-4"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  };

  const ShowSell = () => {
    const currencyRank = getUpgradeRank(PlayerUpgradeType.SELL_CURRENCY);
    let cost = 150;
    cost = cost + currencyRank * 25;
    cost = clamp(cost, 150, 500);

    const hasCurrency = currency > 0;
    let buttonText = 'Sell';

    const sellCurrency = () => {
      adjustCurrency(-1);
      purchaseUpgrade(PlayerUpgradeType.SELL_CURRENCY);
      addScore(cost);
    };

    if (!hasCurrency) {
      buttonText = 'No Funds';
    }

    return (
      <div className="grid grid-cols-4 divide-x-2 divide-slate-600 gap-2 items-center justify-between p-1 bg-slate-700 bg-opacity-80 rounded-md">
        <span className="flex flex-row justify-center items-center gap-1 text-lg text-white p-2">
          {cost}
          <span className="text-yellow-400">
            <FaCoins />
          </span>
        </span>
        <span className="text-center text-lg text-white p-2">=</span>
        <div className="flex flex-col text-center items-center  p-2">
          <span className="hidden md:inline-block text-lg text-white font-bold">
            Cost:
          </span>
          <span className="flex flex-row items-center justify-center gap-1 text-lg text-white">
            1 <FaGem />
          </span>
        </div>
        <div className="text-lg text-white p-2">
          <Button
            variant="primary"
            disabled={!hasCurrency}
            onClick={sellCurrency}
            className="p-2 md:p-4"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <CenterScreenContainer innerClassName="bg-slate-600 bg-opacity-90">
      <span className="text-2xl md:text-3xl font-bold text-white">Store</span>
      <ContentPanel className="bg-slate-700 bg-opacity-80">
        <ShowCurrentCurrency />
      </ContentPanel>

      <div className="flex-auto"></div>
      <div className="flex flex-col gap-2">
        <span className="text-xl md:text-2xl font-bold text-white">
          Upgrades
        </span>
        <ShowUpgrade upgradeType={PlayerUpgradeType.UPGRADE_HEALTH} />
        <ShowUpgrade upgradeType={PlayerUpgradeType.UPGRADE_ENERGY} />
        <ShowUpgrade upgradeType={PlayerUpgradeType.UPGRADE_WEAPON} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xl md:text-2xl font-bold text-white">Sell</span>
        <ShowSell />
      </div>
      <div className="flex-auto"></div>
      <div className="flex flex-col gap-2 items-center">
        <div className="flex flex-row gap-2 bg-slate-500 p-3 rounded">
          <ContentPanel>
            <ShowCurrentScore />
          </ContentPanel>
          <ContentPanel>
            <ShowCurrentHealth showPoisoning={false} />
          </ContentPanel>
          <ContentPanel>
            <ShowCurrentEnergy />
          </ContentPanel>
          <ContentPanel>
            <ShowCurrentAttacks />
          </ContentPanel>
        </div>
        <div className="pb-3 flex items-center gap-5">
          <Button
            onClick={backToFloorMenu}
            variant="danger"
            leftIcon={<FaArrowLeft />}
          >
            Back to Floor
          </Button>
        </div>
      </div>
    </CenterScreenContainer>
  );
};
