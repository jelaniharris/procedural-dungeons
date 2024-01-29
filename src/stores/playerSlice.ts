import { UpgradeData } from '@/components/types/GameData';
import {
  Enemy,
  EnemyStatus,
  Item,
  ItemType,
  LocationActionType,
  PlayerUpgradeType,
  PlayerUpgrades,
  Provision,
  ProvisionType,
  SourceType,
  StatusEffect,
  StatusEffectEvent,
  StatusEffectType,
  TileType,
} from '@/components/types/GameTypes';
import { Point2D } from '@/utils/Point2D';
import { MathUtils } from 'three';
import { StateCreator } from 'zustand';
import { AudioSlice } from './audioSlice';
import { EnemySlice } from './enemySlice';
import { MapSlice } from './mapSlice';

export interface PlayerSlice {
  playerPosition: Point2D;
  playerRotation: number;
  playerZOffset: number;
  score: number;
  energy: number;
  maxEnergy: number;
  health: number;
  currency: number;
  attacks: number;
  maxAttacks: number;
  maxHealth: number;
  isDead: boolean;
  provisions: Provision[];
  setDead: () => void;
  getPlayerLocation: () => Point2D;
  movePlayerLocation: (
    location: Point2D,
    noClip?: boolean,
    zOffset?: number
  ) => boolean;
  adjustPlayer: (
    xOffset: number,
    yOffset: number,
    noClip?: boolean,
    zOffset?: number
  ) => boolean;
  getPlayerZOffset: () => number;
  checkPlayerLocation: () => PlayerLocationResults;
  checkPlayerStandingLocation: () => void;
  adjustHealth: (amount: number, source?: SourceType) => AdjustHealthResults;
  getMaxHealth: () => number;
  clampHealth: () => void;
  atFullHealth: () => boolean;
  adjustAttacks: (amount: number) => boolean;
  getMaxAttacks: () => number;
  atMaxAttacks: () => boolean;
  addScore: (score: number, source?: SourceType) => number;
  modifyEnergy: (amount: number) => void;
  getMaxEnergy: () => number;
  isPlayerAtTileType: (tileType: TileType) => boolean;
  resetPlayer: () => void;

  // Tick player
  tickPlayer: () => void;

  // Status Effects
  statusEffects: StatusEffect[];
  addStatusEffect: (statusEffect: StatusEffect) => boolean;
  hasStatusEffect: (
    statusEffectType: StatusEffectType
  ) => StatusEffect | undefined;
  reduceStatusEffect: (
    statusEffectType: StatusEffectType,
    amount: number
  ) => StatusEffect | null;
  resetStatusEffects: () => void;
  purgeExpiredStatusEffects: () => void;
  removeStatusEffect: (statusEffectType: StatusEffectType) => boolean;
  triggerStatusEffect: (
    statusEffectType: StatusEffectType,
    statusEffectEvent: StatusEffectEvent
  ) => void;
  tickStatusEffects: () => void;

  // Currency
  adjustCurrency: (amount: number) => void;

  // Attacking
  canPlayerAttackEnemy: (enemy: Enemy) => boolean;
  playerPerformAttack: (enemy: Enemy) => void;

  // Provisions
  determineEnergyBonus: (givenEnergy: number) => number;
  addProvision: (provision: Provision) => void;
  hasProvision: (provisionType: ProvisionType) => Provision | undefined;
  resetProvisions: () => void;
  triggeredProvision: (provision: Provision) => void;

  // Upgrades
  upgrades: PlayerUpgrades;
  resetUpgrades: () => void;
  purchaseUpgrade: (upgradeType: PlayerUpgradeType) => void;
  getUpgradeValue: (upgradeType: PlayerUpgradeType) => number;
  getUpgradeRank: (upgradeType: PlayerUpgradeType) => number;
}

export type PlayerLocationResults = {
  result: LocationActionType;
  position: Point2D;
  item?: Item | null;
};

export type AdjustHealthResults = {
  isDead: boolean;
  amountAdjusted: number;
};

export const createPlayerSlice: StateCreator<
  PlayerSlice & MapSlice & EnemySlice & AudioSlice,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  playerPosition: { x: 5, y: 5 },
  playerZOffset: 0,
  score: 0,
  energy: 10,
  maxEnergy: 100,
  attacks: 1,
  maxAttacks: 2,
  currency: 0,
  isDead: false,
  playerRotation: 0,
  health: 2,
  maxHealth: 2,
  provisions: [],
  upgrades: {
    healthUpgrades: 0,
    energyUpgrades: 0,
    weaponUpgrades: 0,
    scoreExchanges: 0,
  },
  statusEffects: [],
  resetPlayer() {
    const resetSet = {
      score: 0,
      energy: 50,
      maxEnergy: 50,
      isDead: false,
      playerRotation: 0,
      attacks: 0,
      maxAttacks: 2,
      health: 2,
      maxHealth: 2,
      statusEffects: [],
    };
    set(resetSet);
    get().resetUpgrades();
  },
  setDead() {
    set({ isDead: true });
  },
  getPlayerLocation: () => {
    const playerPosition = get().playerPosition;
    return playerPosition;
  },
  getPlayerZOffset: () => {
    return get().playerZOffset;
  },
  movePlayerLocation(location: Point2D, noClip = false, zOffset?: number) {
    const playerPosition = get().playerPosition;
    const xOffset = location.x - playerPosition.x;
    const yOffset = location.y - playerPosition.y;
    return get().adjustPlayer(xOffset, yOffset, noClip, zOffset);
  },
  adjustPlayer(
    xOffset: number,
    yOffset: number,
    noClip = false,
    zOffset?: number
  ) {
    const isBlockWallOrNull = get().isBlockWallOrNull;
    const currentMapData = get().mapData;
    const oldPlayerData = get().playerPosition;
    //const playerData = get().playerPosition;
    const playerData = { x: oldPlayerData.x, y: oldPlayerData.y };
    let currentPlayerRotation = get().playerRotation;

    if (
      !noClip &&
      isBlockWallOrNull(
        currentMapData[playerData.x + xOffset][playerData.y + yOffset]
      )
    ) {
      return false;
    }

    //console.log('[adjustPlayer] Old position:', playerData);

    playerData.x = playerData.x + xOffset;
    playerData.y = playerData.y + yOffset;

    if (xOffset < 0) {
      currentPlayerRotation = MathUtils.degToRad(270);
    } else if (xOffset > 0) {
      currentPlayerRotation = MathUtils.degToRad(90);
    }

    if (yOffset < 0) {
      currentPlayerRotation = MathUtils.degToRad(180);
    } else if (yOffset > 0) {
      currentPlayerRotation = MathUtils.degToRad(0);
    }

    //console.log('[adjustPlayer] New position:', playerData);

    set(() => ({
      playerPosition: playerData,
      playerRotation: currentPlayerRotation,
      playerZOffset: zOffset ? zOffset : 0,
    }));
    return true;
  },
  addScore(amount: number, source = SourceType.NONE) {
    let newAmount = amount;
    if (source === SourceType.TREASURE) {
      const coinPurseProvision = get().hasProvision(ProvisionType.COIN_PURSE);
      if (coinPurseProvision) {
        newAmount = newAmount + newAmount * 0.05;
        get().triggeredProvision(coinPurseProvision);
      }
    }
    newAmount = Math.round(newAmount);

    set((store) => ({ score: store.score + newAmount }));
    return newAmount;
  },
  adjustAttacks(amount: number): boolean {
    const currentAttacks = get().attacks;
    const maxAttacks = get().getMaxAttacks();
    const newAttacks = currentAttacks + amount;
    set(() => ({ attacks: Math.max(0, Math.min(newAttacks, maxAttacks)) }));
    return newAttacks != 0;
  },
  getMaxAttacks: () => {
    let maxAttacks = get().maxAttacks;
    maxAttacks += get().getUpgradeValue(PlayerUpgradeType.UPGRADE_WEAPON);
    return maxAttacks;
  },
  adjustHealth(amount: number, source = SourceType.NONE): AdjustHealthResults {
    let newAmount = amount;
    const currentHealth = get().health;
    const maxHealth = get().getMaxHealth();
    if (source === SourceType.POTION) {
      const tinFlaskProvision = get().hasProvision(ProvisionType.TIN_FLASK);
      if (
        tinFlaskProvision &&
        Math.random() < tinFlaskProvision.numberValue / 100
      ) {
        newAmount += 1;
        get().triggeredProvision(tinFlaskProvision);
      }
    }
    const newHealth = currentHealth + newAmount;
    set(() => ({ health: Math.max(0, Math.min(newHealth, maxHealth)) }));
    return { isDead: newHealth != 0, amountAdjusted: newAmount };
  },
  clampHealth() {
    const currentHealth = get().health;
    const maxHealth = get().getMaxHealth();
    set(() => ({ health: Math.max(0, Math.min(currentHealth, maxHealth)) }));
  },
  getMaxHealth() {
    let maxHealth = get().maxHealth;
    const hasStatusEffect = get().hasStatusEffect;
    const chainMailProvision = get().hasProvision(ProvisionType.CHAIN_MAIL);

    // If they have chainmail and aren't starving
    if (
      chainMailProvision &&
      hasStatusEffect(StatusEffectType.STARVING) == undefined
    ) {
      maxHealth += chainMailProvision.numberValue;
    }
    const upgradeValue = get().getUpgradeValue(
      PlayerUpgradeType.UPGRADE_HEALTH
    );

    maxHealth += upgradeValue;
    console.log('Max Health: ', upgradeValue);

    return maxHealth;
  },
  atMaxAttacks() {
    const currentAttacks = get().attacks;
    const maxAttacks = get().getMaxAttacks();
    return currentAttacks === maxAttacks;
  },
  atFullHealth() {
    const currentHealth = get().health;
    const maxHealth = get().getMaxHealth();
    return currentHealth === maxHealth;
  },
  modifyEnergy(amount: number) {
    const currentEnergy = get().energy;
    const maxEnergy = get().getMaxEnergy();

    let newEnergy = currentEnergy + amount;
    newEnergy = Math.max(0, Math.min(newEnergy, maxEnergy));

    if (newEnergy <= 0) {
      get().addStatusEffect({
        statusEffectType: StatusEffectType.STARVING,
        duration: 0,
        canExpire: false,
        canStack: false,
      });
      get().clampHealth();
    } else {
      if (get().hasStatusEffect(StatusEffectType.STARVING)) {
        get().removeStatusEffect(StatusEffectType.STARVING);
      }
    }

    set(() => ({ energy: newEnergy }));
  },
  getMaxEnergy() {
    let maxEnergy = get().maxEnergy;
    maxEnergy += get().getUpgradeValue(PlayerUpgradeType.UPGRADE_ENERGY);
    return maxEnergy;
  },
  isPlayerAtTileType(tileType: TileType) {
    const currentMapData = get().mapData;
    const currentPlayerData = get().playerPosition;

    if (currentMapData[currentPlayerData.x][currentPlayerData.y] == tileType) {
      return true;
    }
    return false;
  },
  checkPlayerLocation(): PlayerLocationResults {
    // Check for item at location
    const getItemPosition = get().getItemPosition;
    const currentPlayerData = get().playerPosition;
    const atFullHealth = get().atFullHealth;
    const atMaxAttacks = get().atMaxAttacks;
    const items = get().items;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;
    const isPlayerAtTileType = get().isPlayerAtTileType;
    const locationResults: PlayerLocationResults = {
      result: LocationActionType.NOTHING,
      position: currentPlayerData,
    };
    let locationDetails: LocationActionType = LocationActionType.NOTHING;

    // Check if the current position has an item
    const itemAtLocation = getItemPosition(
      currentPlayerData.x,
      currentPlayerData.y
    );

    if (itemAtLocation) {
      console.log(
        '[checkPlayerLocation] Item at location: ',
        itemAtLocation.type,
        ' - ',
        itemAtLocation.id
      );
      const oldItems = [...items];
      let itemCollectable: boolean = false;
      switch (itemAtLocation.type) {
        case ItemType.ITEM_POTION:
          if (!atFullHealth()) {
            itemCollectable = true;
          }
          break;
        case ItemType.ITEM_WEAPON:
          if (!atMaxAttacks()) {
            itemCollectable = true;
          }
          break;
        default:
          itemCollectable = true;
          break;
      }

      if (itemCollectable) {
        delete oldItems[
          getItemPositionOnGrid(currentPlayerData.x, currentPlayerData.y)
        ];
        set({ items: oldItems });

        locationDetails = locationDetails | LocationActionType.COLLECTED_ITEM;
        locationResults.item = itemAtLocation;
      }
    }

    // Check if player is at a door
    if (isPlayerAtTileType(TileType.TILE_WALL_DOOR)) {
      locationDetails = locationDetails | LocationActionType.AT_DOOR;
    }

    // Check if player is at exit
    if (isPlayerAtTileType(TileType.TILE_EXIT)) {
      locationDetails = locationDetails | LocationActionType.AT_EXIT;
    }

    locationResults.result = locationResults.result | locationDetails;

    return locationResults;
  },
  checkPlayerStandingLocation: () => {
    const isPlayerAtTileType = get().isPlayerAtTileType;
    // Check if player is over water
    if (isPlayerAtTileType(TileType.TILE_WATER)) {
      if (!get().hasStatusEffect(StatusEffectType.SLOW)) {
        get().addStatusEffect({
          statusEffectType: StatusEffectType.SLOW,
          duration: 1,
          canExpire: true,
          canStack: true,
        });
      }
    }

    if (isPlayerAtTileType(TileType.TILE_POISON)) {
      get().addStatusEffect({
        statusEffectType: StatusEffectType.POISON,
        duration: 1,
        canExpire: true,
        canStack: true,
      });
    }
  },
  canPlayerAttackEnemy: (enemy: Enemy) => {
    const attacks = get().attacks;

    if (enemy.status == EnemyStatus.STATUS_DEAD) {
      return false;
    }

    if (attacks > 0) {
      return true;
    }
    return false;
  },
  playerPerformAttack: (enemy: Enemy) => {
    const adjustAttacks = get().adjustAttacks;
    const removeEnemy = get().removeEnemy;
    const playAudio = get().playAudio;

    let attackAdjustmentAmount = -1;

    console.log(get().provisions);

    const boneNecklaceProvision = get().hasProvision(
      ProvisionType.BONE_NECKLACE
    );
    if (boneNecklaceProvision) {
      get().addScore(boneNecklaceProvision.numberValue);
      get().triggeredProvision(boneNecklaceProvision);
    }
    const whetstoneProvision = get().hasProvision(ProvisionType.WHETSTONE);
    if (
      whetstoneProvision &&
      Math.random() < whetstoneProvision.numberValue / 100
    ) {
      attackAdjustmentAmount = 0;
      get().triggeredProvision(whetstoneProvision);
    }

    //TODO Check if enemy is facing the other way
    removeEnemy(enemy);
    playAudio('mnstr1.ogg', 0.5);
    adjustAttacks(attackAdjustmentAmount);
  },
  determineEnergyBonus: (givenEnergy: number) => {
    const hasProvision = get().hasProvision;
    let newBonus = givenEnergy;
    const spiceProvision = hasProvision(ProvisionType.SPICES);
    if (spiceProvision) {
      newBonus = newBonus * (1 + spiceProvision.numberValue / 100);
      get().triggeredProvision(spiceProvision);
    }
    return Math.round(newBonus);
  },
  addProvision: (provision: Provision) => {
    const provisions = get().provisions;
    set({
      provisions: [...provisions, provision],
    });
  },
  hasProvision: (provisionType: ProvisionType) => {
    const provisions = get().provisions;
    return provisions.find((prov) => prov.provisionType === provisionType);
  },
  resetProvisions: () => {
    set({
      provisions: [],
    });
  },
  triggeredProvision: (provision: Provision) => {
    console.log(provision);
  },
  addStatusEffect: (statusEffect: StatusEffect): boolean => {
    const statusEffects = get().statusEffects;
    const triggerStatusEffect = get().triggerStatusEffect;
    const foundStatusEffect = statusEffects.find(
      (sef) => sef && sef.statusEffectType === statusEffect.statusEffectType
    );

    if (foundStatusEffect) {
      if (foundStatusEffect.canStack) {
        foundStatusEffect.duration += statusEffect.duration;
      }
      return true;
    } else {
      set({
        statusEffects: [...statusEffects, statusEffect],
      });
      triggerStatusEffect(
        statusEffect.statusEffectType,
        StatusEffectEvent.ADDED
      );
      return true;
    }
    //TODO add immunity effects
    return false;
  },
  hasStatusEffect: (
    statusEffectType: StatusEffectType
  ): StatusEffect | undefined => {
    const statusEffects = get().statusEffects;
    return statusEffects.find(
      (sef) => sef && sef.statusEffectType === statusEffectType
    );
  },
  reduceStatusEffect: (
    statusEffectType: StatusEffectType,
    amount: number
  ): StatusEffect | null => {
    const statusEffects = get().statusEffects;
    const foundStatusEffectIndex = statusEffects.findIndex(
      (sef) => sef && sef.statusEffectType === statusEffectType
    );
    if (foundStatusEffectIndex > 0) {
      const foundStatusEffect = statusEffects[foundStatusEffectIndex];

      if (!foundStatusEffect.canExpire) {
        return foundStatusEffect;
      }

      foundStatusEffect.duration -= amount;
      if (foundStatusEffect.duration < 0) {
        foundStatusEffect.duration == 0;
      }
      statusEffects[foundStatusEffectIndex] = foundStatusEffect;
      set({
        statusEffects: statusEffects,
      });

      return foundStatusEffect;
    }
    return null;
  },
  resetStatusEffects: () => {
    set({ statusEffects: [] });
  },
  purgeExpiredStatusEffects: () => {
    const statusEffects = get().statusEffects;
    const triggerStatusEffect = get().triggerStatusEffect;

    const newStatusEffectsList: StatusEffect[] = [];

    for (const seff of statusEffects) {
      // If status efect cannot expire
      if (!seff.canExpire) {
        continue;
      }
      if (seff.canExpire && seff.duration > 0) {
        newStatusEffectsList.push(seff);
      } else {
        triggerStatusEffect(seff.statusEffectType, StatusEffectEvent.REMOVED);
      }
    }

    set({
      statusEffects: newStatusEffectsList,
    });
  },
  removeStatusEffect: (statusEffectType: StatusEffectType): boolean => {
    const statusEffects = get().statusEffects;
    const triggerStatusEffect = get().triggerStatusEffect;

    const newStatusEffectsList: StatusEffect[] = [...statusEffects];
    const foundStatusEffectIndex = statusEffects.findIndex(
      (sef) => sef && sef.statusEffectType === statusEffectType
    );
    if (foundStatusEffectIndex < 0) {
      return false;
    }

    delete newStatusEffectsList[foundStatusEffectIndex];
    triggerStatusEffect(statusEffectType, StatusEffectEvent.REMOVED);

    set({
      statusEffects: newStatusEffectsList,
    });
    return true;
  },
  triggerStatusEffect: (
    statusEffectType: StatusEffectType,
    statusEffectEvent: StatusEffectEvent
  ) => {
    console.log(statusEffectType, statusEffectEvent);
  },
  tickStatusEffects: () => {
    const statusEffects = get().statusEffects;
    const newStatusEffectsList: StatusEffect[] = [...statusEffects];

    newStatusEffectsList.forEach((effect) => {
      if (effect.canExpire) {
        effect.duration -= 1;

        if (effect.duration < 0) {
          effect.duration == 0;
        }
      }
    });
    set({
      statusEffects: newStatusEffectsList,
    });
  },
  tickPlayer: () => {
    get().tickStatusEffects();
    get().purgeExpiredStatusEffects();
  },
  adjustCurrency: (amount: number) => {
    const currency = get().currency;
    const newCurrency = currency + amount;
    set(() => ({ currency: newCurrency > 0 ? newCurrency : 0 }));
  },
  resetUpgrades: () => {
    set({
      upgrades: {
        healthUpgrades: 0,
        energyUpgrades: 0,
        weaponUpgrades: 0,
        scoreExchanges: 0,
      },
    });
  },
  purchaseUpgrade: (upgradeType: PlayerUpgradeType) => {
    const upgrades = get().upgrades;
    const newUpgrades = { ...upgrades };
    switch (upgradeType) {
      case PlayerUpgradeType.UPGRADE_HEALTH:
        newUpgrades.healthUpgrades += 1;
        break;
      case PlayerUpgradeType.UPGRADE_ENERGY:
        newUpgrades.energyUpgrades += 1;
        break;
      case PlayerUpgradeType.UPGRADE_WEAPON:
        newUpgrades.weaponUpgrades += 1;
        break;
      case PlayerUpgradeType.SELL_CURRENCY:
        newUpgrades.scoreExchanges += 1;
        break;
    }
    set({ upgrades: newUpgrades });
  },
  getUpgradeRank: (upgradeType: PlayerUpgradeType) => {
    const upgrades = get().upgrades;
    switch (upgradeType) {
      case PlayerUpgradeType.UPGRADE_HEALTH:
        return upgrades.healthUpgrades;
      case PlayerUpgradeType.UPGRADE_ENERGY:
        return upgrades.energyUpgrades;
      case PlayerUpgradeType.UPGRADE_WEAPON:
        return upgrades.weaponUpgrades;
      case PlayerUpgradeType.SELL_CURRENCY:
        return upgrades.scoreExchanges;
    }
  },
  getUpgradeValue: (upgradeType: PlayerUpgradeType) => {
    const data = UpgradeData.find((val) => val.type === upgradeType);
    if (!data) return 0;

    const upgradeAmount = get().getUpgradeRank(upgradeType);

    console.log('Upgrade amount: ', upgradeAmount, ' for ', upgradeType);

    if (upgradeAmount <= 0) {
      return 0;
    }

    const sum = data.amountUpgrade
      .slice(0, upgradeAmount)
      .reduce((a, b) => a + b, 0);

    console.log('Sum: ', sum);
    return sum;
  },
});
