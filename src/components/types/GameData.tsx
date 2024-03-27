import {
  ItemDataInfo,
  ItemType,
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
    description: 'No description',
  },
  {
    statusEffectType: StatusEffectType.STARVING,
    name: 'Starving',
    cssStyles: 'text-red-400',
    description: 'Doubles enemies movement distance. Eat food to remove.',
  },
  {
    statusEffectType: StatusEffectType.POISON,
    name: 'Poison',
    cssStyles: 'text-green-400',
    description: 'Turns your health to one point. Decays over time.',
  },
  {
    statusEffectType: StatusEffectType.CONFUSION,
    name: 'Confusion',
    cssStyles: 'text-yellow-400',
    description: 'Makes you move in a random direction.',
  },
  {
    statusEffectType: StatusEffectType.SLOW,
    name: 'Slow',
    cssStyles: 'text-blue-400',
    description: "Increases enemy's movement distance by 1",
  },
  {
    statusEffectType: StatusEffectType.HASTE,
    name: 'Haste',
    cssStyles: 'text-yellow-400',
    description: "Reduces enemy's movement distance by 1",
  },
  {
    statusEffectType: StatusEffectType.FLYING,
    name: 'Flying',
    cssStyles: 'text-purple-400',
    description: 'Ignore effects from liquids and spike traps',
  },
];

export const ItemData: ItemDataInfo[] = [
  {
    name: 'Coin',
    scoreValue: 10,
    itemType: ItemType.ITEM_COIN,
    description: 'Worth %SCORE% gold',
    grouping: 'treasure',
    icon: 'CoinIcon.png',
  },
  {
    name: 'Chalice',
    scoreValue: 25,
    itemType: ItemType.ITEM_CHALICE,
    description: 'Worth %SCORE% gold',
    grouping: 'treasure',
    icon: 'ChaliceIcon.png',
  },
  {
    name: 'Crown',
    scoreValue: 75,
    itemType: ItemType.ITEM_CROWN,
    description: 'Worth %SCORE% gold',
    grouping: 'treasure',
    icon: 'CrownIcon.png',
  },
  {
    name: 'Ignots',
    scoreValue: 200,
    itemType: ItemType.ITEM_INGOT_STACK,
    description: 'Worth %SCORE% gold',
    grouping: 'treasure',
    icon: 'GoldStackIcon.png',
  },
  {
    name: 'Key',
    scoreValue: 5,
    itemType: ItemType.ITEM_KEY,
    description: 'Worth %SCORE% gold. Allows you to unlock nearby chests.',
    grouping: 'tool',
    icon: 'KeyIcon.png',
  },
  {
    name: 'Dagger',
    itemType: ItemType.ITEM_WEAPON,
    numberValue: 1,
    description:
      'Gives %AMOUNT% weapon. Allows you to attack adjacent enemies.',
    grouping: 'tool',
    icon: 'DaggerIcon.png',
  },
  {
    name: 'Diamond',
    itemType: ItemType.ITEM_DIAMOND,
    numberValue: 1,
    scoreValue: 25,
    description:
      'Worth %AMOUNT% currency and %SCORE% gold. Spendable at the shop between floors.',
    grouping: 'tool',
    icon: 'DiamondIcon.png',
  },
  {
    name: 'Health Potion',
    itemType: ItemType.ITEM_HEALTH_POTION,
    numberValue: 1,
    description: 'Recovers %AMOUNT% missing health',
    grouping: 'potion',
    icon: 'HealthPotionIcon.png',
  },
  {
    name: 'Flying Potion',
    itemType: ItemType.ITEM_FLY_POTION,
    numberValue: 1,
    statusTurnsValue: 15,
    description: 'Adds FLYING status for %STATUSAMOUNT% turns',
    grouping: 'potion',
    icon: 'FlyPotionIcon.png',
  },
  {
    name: 'Floor Chicken',
    itemType: ItemType.ITEM_CHICKEN,
    numberValue: 35,
    description: 'Restores %AMOUNT% energy',
    grouping: 'food',
    icon: 'ChickenIcon.png',
  },
  {
    name: 'Dungeon Fruit',
    itemType: ItemType.ITEM_APPLE,
    numberValue: 15,
    statusTurnsValue: 10,
    description:
      'Restores %AMOUNT% energy. Gives HASTE for %STATUSAMOUNT% turns',
    grouping: 'food',
    icon: 'AppleIcon.png',
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
  {
    name: 'Studded Bracelet',
    numberValue: 3,
    provisionType: ProvisionType.STUDDED_BRACELET,
    description:
      'If at full health, adds %NUM% diamonds when you enter a new floor.',
  },
];
