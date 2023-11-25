import {
  Enemy,
  EnemyStatus,
  Item,
  ItemType,
  LocationActionType,
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
  score: number;
  energy: number;
  maxEnergy: number;
  health: number;
  attacks: number;
  maxAttacks: number;
  maxHealth: number;
  isDead: boolean;
  isTired: boolean;
  setDead: () => void;
  getPlayerLocation: () => Point2D;
  movePlayerLocation: (location: Point2D, noClip?: boolean) => boolean;
  adjustPlayer: (xOffset: number, yOffset: number, noClip?: boolean) => boolean;
  checkPlayerLocation: () => PlayerLocationResults;
  adjustHealth: (amount: number) => boolean;
  atFullHealth: () => boolean;
  adjustAttacks: (amount: number) => boolean;
  atMaxAttacks: () => boolean;
  addScore: (score: number) => void;
  modifyEnergy: (amount: number) => void;
  isPlayerAtTileType: (tileType: TileType) => boolean;
  resetPlayer: () => void;
  canPlayerAttackEnemy: (enemy: Enemy) => boolean;
  playerPerformAttack: (enemy: Enemy) => void;
}

export type PlayerLocationResults = {
  result: LocationActionType;
  position: Point2D;
  item?: Item | null;
};

export const createPlayerSlice: StateCreator<
  PlayerSlice & MapSlice & EnemySlice & AudioSlice,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  playerPosition: { x: 5, y: 5 },
  score: 0,
  energy: 10,
  maxEnergy: 100,
  attacks: 1,
  maxAttacks: 2,
  isDead: false,
  playerRotation: 0,
  health: 2,
  maxHealth: 2,
  isTired: false,
  resetPlayer() {
    const resetSet = {
      score: 0,
      energy: 50,
      maxEnergy: 100,
      isDead: false,
      playerRotation: 0,
      attacks: 0,
      maxAttacks: 2,
      health: 2,
      maxHealth: 2,
      isTired: false,
    };
    set(resetSet);
  },
  setDead() {
    set({ isDead: true });
  },
  getPlayerLocation: () => {
    const playerPosition = get().playerPosition;
    return playerPosition;
  },
  movePlayerLocation(location: Point2D, noClip = false) {
    const playerPosition = get().playerPosition;
    const xOffset = location.x - playerPosition.x;
    const yOffset = location.y - playerPosition.y;
    return get().adjustPlayer(xOffset, yOffset, noClip);
  },
  adjustPlayer(xOffset: number, yOffset: number, noClip = false) {
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
    }));
    return true;
  },
  addScore(amount: number) {
    set((store) => ({ score: store.score + amount }));
  },
  adjustAttacks(amount: number): boolean {
    const currentAttacks = get().attacks;
    const maxAttacks = get().maxAttacks;
    const newAttacks = currentAttacks + amount;
    set(() => ({ attacks: Math.max(0, Math.min(newAttacks, maxAttacks)) }));
    return newAttacks != 0;
  },
  adjustHealth(amount: number): boolean {
    const currentHealth = get().health;
    const maxHealth = get().maxHealth;
    const newHealth = currentHealth + amount;
    set(() => ({ health: Math.max(0, Math.min(newHealth, maxHealth)) }));
    return newHealth != 0;
  },
  atMaxAttacks() {
    const currentAttacks = get().attacks;
    const maxAttacks = get().maxAttacks;
    return currentAttacks === maxAttacks;
  },
  atFullHealth() {
    const currentHealth = get().health;
    const maxHealth = get().maxHealth;
    return currentHealth === maxHealth;
  },
  modifyEnergy(amount: number) {
    const currentEnergy = get().energy;
    const maxEnergy = get().maxEnergy;

    let newEnergy = currentEnergy + amount;
    newEnergy = Math.max(0, Math.min(newEnergy, maxEnergy));

    set(() => ({ energy: newEnergy, isTired: newEnergy <= 0 }));
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

    //TODO Check if enemy is facing the other way

    removeEnemy(enemy);
    playAudio('mnstr1.ogg', 0.5);
    adjustAttacks(-1);
  },
});
