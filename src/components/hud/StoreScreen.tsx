import { GameState, useStore } from '@/stores/useStore';
import { FaArrowLeft, FaBolt, FaGem, FaHeart } from 'react-icons/fa';
import { LuSword } from 'react-icons/lu';
import Button from '../input/Button';
import { UpgradeData } from '../types/GameData';
import { GameStatus, PlayerUpgradeType } from '../types/GameTypes';
import CenterScreenContainer from './CenterScreen';

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

    let purchaseDisabled = currency < currentCost;
    const isMaxed = rank === data.maxRank;

    if (isMaxed) {
      buttonText = 'Maxed';
      purchaseDisabled = true;
    }

    const purchaseRank = () => {
      purchaseUpgrade(upgradeType);
      adjustCurrency(-currentCost);
    };

    let upgradeIcon: JSX.Element | null = null;
    switch (upgradeType) {
      case PlayerUpgradeType.UPGRADE_HEALTH:
        upgradeIcon = <FaHeart />;
        break;
      case PlayerUpgradeType.UPGRADE_ENERGY:
        upgradeIcon = <FaBolt />;
        break;
      case PlayerUpgradeType.UPGRADE_WEAPON:
        upgradeIcon = <LuSword />;
        break;
    }

    return (
      <div className="flex flex-row gap-2 items-center justify-between bg-slate-700 bg-opacity-80 p-3 rounded-md">
        <div className="flex flex-col gap-2">
          <span className="text-lg text-white">{data.name}</span>
          <span className="text-lg text-white">
            {rank}/{data.maxRank}
          </span>
        </div>
        <div className="flex flex-col gap-2 text-lg text-white ">
          Next:
          {!isMaxed && (
            <div className="flex flex-row gap-1 items-center">
              {'+'}
              {data.amountUpgrade[rank] || 0}
              {upgradeIcon}
            </div>
          )}
          {isMaxed && <div>-</div>}
        </div>
        <div className="text-lg text-white">
          {!purchaseDisabled && (
            <span className="flex flex-row gap-1 items-center">
              {currentCost}
              <FaGem />
            </span>
          )}
          {purchaseDisabled && <span>-</span>}
        </div>
        <Button
          variant="primary"
          disabled={purchaseDisabled}
          onClick={purchaseRank}
        >
          {buttonText}
        </Button>
      </div>
    );
  };

  return (
    <CenterScreenContainer>
      <span className="text-2xl md:text-3xl font-bold text-white">Store</span>
      <div className="flex-auto"></div>
      <div className="flex flex-col gap-3">
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
