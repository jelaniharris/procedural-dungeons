import {
  EnemyType,
  Gases,
  StatusEffectType,
} from '@/components/types/GameTypes';

export const getGasFromEnemyType = (enemyType: EnemyType) => {
  let gasType = Gases.GAS_NONE;
  switch (enemyType) {
    case EnemyType.ENEMY_GAS_POISON:
      gasType = Gases.GAS_POISON;
      break;
    case EnemyType.ENEMY_GAS_CONFUSION:
      gasType = Gases.GAS_CONFUSION;
      break;
  }
  return gasType;
};

export const getEnemyTypeFromGasType = (gasType: Gases) => {
  let enemyType = EnemyType.ENEMY_NONE;
  switch (gasType) {
    case Gases.GAS_POISON:
      enemyType = EnemyType.ENEMY_GAS_POISON;
      break;
    case Gases.GAS_CONFUSION:
      enemyType = EnemyType.ENEMY_GAS_CONFUSION;
      break;
  }
  return enemyType;
};

export const getStatusTypeFromEnemyType = (enemyType: EnemyType) => {
  let statusType = StatusEffectType.NONE;
  switch (enemyType) {
    case EnemyType.ENEMY_GAS_POISON:
      statusType = StatusEffectType.POISON;
      break;
    case EnemyType.ENEMY_GAS_CONFUSION:
      statusType = StatusEffectType.CONFUSION;
      break;
  }
  return statusType;
};
