import {
  CostType,
  ItemDataInfo,
  ItemType,
  PlayerUpgradeDataInfo,
  PlayerUpgradeType,
  Provision,
  ProvisionRarity,
  ProvisionType,
  StatusEffectDataInfo,
  StatusEffectType,
} from './GameTypes';

export type ProvisionDefinition = Omit<Provision, 'rarity'> & {
  rarityValues: Record<ProvisionRarity, number>;
  rarityValues2?: Record<ProvisionRarity, number>;
  costValues?: Record<ProvisionRarity, number>;
};

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

export const ProvisionData: ProvisionDefinition[] = [
  {
    name: 'Spices',
    numberValue: 20,
    provisionType: ProvisionType.SPICES,
    description: 'Food gives %PERCENT% more energy',
    rarityValues: { COMMON: 20, RARE: 25, EPIC: 33, LEGENDARY: 50 },
  },
  {
    name: 'Bone Necklace',
    numberValue: 6,
    provisionType: ProvisionType.BONE_NECKLACE,
    description: 'Earn %NUM% additional score per enemy kill',
    rarityValues: { COMMON: 6, RARE: 8, EPIC: 10, LEGENDARY: 15 },
  },
  {
    name: 'Coin Purse',
    numberValue: 8,
    provisionType: ProvisionType.COIN_PURSE,
    description: 'Additional %PERCENT% score earned per treasure',
    rarityValues: { COMMON: 8, RARE: 10, EPIC: 12, LEGENDARY: 16 },
  },
  {
    name: 'Tin Flask',
    numberValue: 20,
    provisionType: ProvisionType.TIN_FLASK,
    description:
      'Potions have a %PERCENT% chance of healing an additional heart',
    rarityValues: { COMMON: 20, RARE: 25, EPIC: 33, LEGENDARY: 50 },
  },
  {
    name: 'Whetstone',
    numberValue: 30,
    provisionType: ProvisionType.WHETSTONE,
    description:
      'Weapons have a %PERCENT% chance of not being consumed after attacking',
    rarityValues: { COMMON: 30, RARE: 40, EPIC: 50, LEGENDARY: 65 },
  },
  {
    name: 'Chain Mail',
    numberValue: 1,
    provisionType: ProvisionType.CHAIN_MAIL,
    description: 'Adds %NUM% more max health if not in STARVATION',
    rarityValues: { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4 },
  },
  {
    name: 'Studded Bracelet',
    numberValue: 2,
    provisionType: ProvisionType.STUDDED_BRACELET,
    description:
      'If at full health, adds 0-%NUM% diamonds when you enter a new floor.',
    rarityValues: { COMMON: 2, RARE: 3, EPIC: 4, LEGENDARY: 6 },
  },
  {
    name: 'Buckler',
    numberValue: 30,
    provisionType: ProvisionType.BUCKLER,
    description:
      'Gives a %PERCENT% chance to avoid taking damage from enemies. Does not work against ghosts.',
    rarityValues: { COMMON: 30, RARE: 35, EPIC: 40, LEGENDARY: 50 },
  },
  {
    name: 'Bandolier',
    numberValue: 50,
    provisionType: ProvisionType.BANDOLIER,
    description:
      'At the start of each floor, %PERCENT% chance to gain a weapon.',
    rarityValues: { COMMON: 50, RARE: 65, EPIC: 80, LEGENDARY: 100 },
  },
  {
    name: 'Cloak',
    numberValue: 25,
    cost: 8,
    costType: CostType.STAMINA,
    provisionType: ProvisionType.CLOAK,
    description:
      'When not starving, %PERCENT% chance to dodge attacks. Each dodge costs %COST% max stamina.',
    rarityValues: { COMMON: 35, RARE: 40, EPIC: 50, LEGENDARY: 60 },
    costValues: { COMMON: 8, RARE: 6, EPIC: 5, LEGENDARY: 4 },
  },
  {
    name: 'Ration',
    numberValue: 40,
    numberValue2: 20,
    provisionType: ProvisionType.RATION,
    description:
      'Once per floor, %PERCENT% chance of a second wind when exhausted, gaining %PERCENT2% max stamina.',
    rarityValues: { COMMON: 40, RARE: 55, EPIC: 65, LEGENDARY: 80 },
    rarityValues2: { COMMON: 20, RARE: 25, EPIC: 30, LEGENDARY: 35 },
  },
  {
    name: 'Spare Blade',
    numberValue: 10,
    cost: 10,
    costType: CostType.STAMINA,
    provisionType: ProvisionType.SPARE_BLADE,
    description:
      'When struck, consumes a weapon charge instead of taking damage. Costs %COST% max stamina. Does not work against ghosts.',
    rarityValues: { COMMON: 10, RARE: 8, EPIC: 6, LEGENDARY: 5 },
    costValues: { COMMON: 10, RARE: 8, EPIC: 6, LEGENDARY: 5 },
  },
];
