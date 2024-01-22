import { GameState, useStore } from '@/stores/useStore';
import { FaArrowLeft, FaBolt, FaGem, FaHeart, FaSquare } from 'react-icons/fa';
import { LuSword } from 'react-icons/lu';
import Button from '../input/Button';
import { UpgradeData } from '../types/GameData';
import { GameStatus, PlayerUpgradeType } from '../types/GameTypes';
import CenterScreenContainer from './CenterScreen';

const RankMeter = ({ rank, maxRank }: { rank: number; maxRank: number }) => {
  const pips = [];
  for (let i = 0; i < rank; i++) {
    pips.push(
      <span className="text-red-500">
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
      <span className="text-gray-700">
        <FaSquare />
      </span>
    );
  }

  return <div className="flex flex-row flex-nowrap">{pips}</div>;
};

export const StoreScreen = () => {
  //const upgrades = useStore((store: GameState) => store.upgrades);
  const currency = useStore((store: GameState) => store.currency);
  const getUpgradeRank = useStore((store: GameState) => store.getUpgradeRank);
  const purchaseUpgrade = useStore((store: GameState) => store.purchaseUpgrade);
  const setGameStatus = useStore((store: GameState) => store.setGameStatus);
  const adjustCurrency = useStore((store: GameState) => store.adjustCurrency);
  const setShowStoreDialog = useStore(
    (store: GameState) => store.setShowStoreDialog
  );

  const backToFloorMenu = () => {
    //setCurrentHud('mainmenu');
    setShowStoreDialog(false);
    setGameStatus(GameStatus.GAME_STARTED);
    //publish(CHANGE_SCENE, { nextScene: 'menu' });
  };

  const ShowUpgrade = ({ upgradeType }: { upgradeType: PlayerUpgradeType }) => {
    let buttonText = 'Upgrade';
    const data = UpgradeData.find((val) => val.type === upgradeType);
    const rank = getUpgradeRank(upgradeType);
    if (!data) return <></>;
    const currentCost = data.rankCost[rank];

    let purchaseDisabled = false;
    const hasFunds = currency < currentCost;
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
          <span className="hidden md:inline-block  font-bold">Cost:</span>
          {!purchaseDisabled && (
            <span className="flex flex-row gap-1 items-center">
              {currentCost}
              <FaGem />
            </span>
          )}
          {purchaseDisabled && <span>-</span>}
        </div>
        <div className=" p-2">
          <Button
            variant="primary"
            disabled={purchaseDisabled}
            onClick={purchaseRank}
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
      <div className="flex-auto"></div>
      <div className="flex flex-col gap-2">
        <span className="text-xl md:text-2xl font-bold text-white">
          Upgrades
        </span>
        <ShowUpgrade upgradeType={PlayerUpgradeType.UPGRADE_HEALTH} />
        <ShowUpgrade upgradeType={PlayerUpgradeType.UPGRADE_ENERGY} />
        <ShowUpgrade upgradeType={PlayerUpgradeType.UPGRADE_WEAPON} />
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-xl md:text-2xl font-bold text-white">Sell</span>
      </div>
      <div className="flex-auto"></div>
      <div className="pb-3 flex items-center gap-5">
        <Button
          onClick={backToFloorMenu}
          variant="danger"
          leftIcon={<FaArrowLeft />}
        >
          Back to Floor
        </Button>
      </div>
    </CenterScreenContainer>
  );
};
