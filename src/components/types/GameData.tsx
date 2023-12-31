import { Provision, ProvisionType } from './GameTypes';

export const ProvisionData: Provision[] = [
  {
    name: 'Spices',
    numberValue: 25,
    provisionType: ProvisionType.SPICES,
    description: 'Food gives %PERCENT% more energy',
  },
  {
    name: 'Bone Necklace',
    numberValue: 5,
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
    numberValue: 50,
    provisionType: ProvisionType.WHETSTONE,
    description:
      'Weapons have a %PERCENT% chance of not being consumed after attacking',
  },
];
