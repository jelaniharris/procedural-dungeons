import {
  PlayerUpgradeDataInfo,
  PlayerUpgradeType,
  Provision,
  ProvisionType,
  StatusEffectDataInfo,
  StatusEffectType,
} from './GameTypes';

export const UpgradeData: PlayerUpgradeDataInfo[] = [
  {
    type: PlayerUpgradeType.UPGRADE_HEALTH,
    name: 'Health',
    maxRank: 4,
    rankCost: [2, 3, 4, 5],
    amountUpgrade: [1, 1, 1, 1],
  },
  {
    type: PlayerUpgradeType.UPGRADE_ENERGY,
    maxRank: 5,
    name: 'Energy',
    rankCost: [1, 2, 3, 4, 5],
    amountUpgrade: [10, 15, 20, 30],
  },
  {
    type: PlayerUpgradeType.UPGRADE_WEAPON,
    maxRank: 3,
    name: 'Weapon',
    rankCost: [1, 3, 5],
    amountUpgrade: [1, 1, 1],
  },
];

export const StatusEffectData: StatusEffectDataInfo[] = [
  {
    statusEffectType: StatusEffectType.NONE,
    name: 'None',
    cssStyles: 'text-slate-400',
  },
  {
    statusEffectType: StatusEffectType.STARVING,
    name: 'Starving',
    cssStyles: 'text-red-400',
  },
  {
    statusEffectType: StatusEffectType.POISON,
    name: 'Poison',
    cssStyles: 'text-green-400',
  },
  {
    statusEffectType: StatusEffectType.CONFUSION,
    name: 'Confusion',
    cssStyles: 'text-yellow-400',
  },
  {
    statusEffectType: StatusEffectType.SLOW,
    name: 'Slow',
    cssStyles: 'text-blue-400',
  },
];

export const ProvisionData: Provision[] = [
  {
    name: 'Spices',
    numberValue: 25,
    provisionType: ProvisionType.SPICES,
    description: 'Food gives %PERCENT% more energy',
  },
  {
    name: 'Bone Necklace',
    numberValue: 8,
    provisionType: ProvisionType.BONE_NECKLACE,
    description: 'Earn %NUM% additional score per enemy kill',
  },
  {
    name: 'Coin Purse',
    numberValue: 10,
    provisionType: ProvisionType.COIN_PURSE,
    description: 'Additional %PERCENT% score earned per treasure',
  },
  {
    name: 'Tin Flask',
    numberValue: 25,
    provisionType: ProvisionType.TIN_FLASK,
    description:
      'Potions have a %PERCENT% chance of healing an additional heart',
  },
  {
    name: 'Whetstone',
    numberValue: 40,
    provisionType: ProvisionType.WHETSTONE,
    description:
      'Weapons have a %PERCENT% chance of not being consumed after attacking',
  },
  {
    name: 'Chain Mail',
    numberValue: 1,
    provisionType: ProvisionType.CHAIN_MAIL,
    description: 'Adds %NUM% more max health if not in STARVATION',
  },
];
