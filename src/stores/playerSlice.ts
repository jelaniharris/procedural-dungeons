import {
  Item,
  ItemType,
  LocationActionType,
  TileType,
} from '@/components/types/GameTypes';
import { Point2D } from '@/utils/Point2D';
import { MathUtils } from 'three';
import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';

export interface PlayerSlice {
  playerPosition: Point2D;
  playerRotation: number;
  score: number;
  energy: number;
  maxEnergy: number;
  health: number;
  maxHealth: number;
  isDead: boolean;
  isTired: boolean;
  setDead: () => void;
  adjustPlayer: (xOffset: number, yOffset: number, noClip?: boolean) => boolean;
  checkPlayerLocation: () => PlayerLocationResults;
  adjustHealth: (amount: number) => boolean;
  atFullHealth: () => boolean;
  addScore: (score: number) => void;
  modifyEnergy: (amount: number) => void;
  isPlayerAtTileType: (tileType: TileType) => boolean;
  resetPlayer: () => void;
}

export type PlayerLocationResults = {
  result: LocationActionType;
  position: Point2D;
  item?: Item | null;
};

export const createPlayerSlice: StateCreator<
  PlayerSlice & MapSlice,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  playerPosition: { x: 5, y: 5 },
  score: 0,
  energy: 10,
  maxEnergy: 100,
  isDead: false,
  playerRotation: 0,
  health: 2,
  maxHealth: 2,
  isTired: false,
  resetPlayer() {
    const resetSet = {
      score: 0,
      energy: 25,
      maxEnergy: 100,
      isDead: false,
      playerRotation: 0,
      health: 2,
      maxHealth: 2,
      isTired: false,
    };
    set(resetSet);
  },
  setDead() {
    set({ isDead: true });
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
      currentPlayerRotation = MathUtils.degToRad(90);
    } else if (xOffset > 0) {
      currentPlayerRotation = MathUtils.degToRad(270);
    }

    if (yOffset < 0) {
      currentPlayerRotation = MathUtils.degToRad(0);
    } else if (yOffset > 0) {
      currentPlayerRotation = MathUtils.degToRad(180);
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
  adjustHealth(amount: number): boolean {
    const currentHealth = get().health;
    const maxHealth = get().maxHealth;
    const newHealth = currentHealth + amount;
    set(() => ({ health: Math.max(0, Math.min(newHealth, maxHealth)) }));
    return newHealth != 0;
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
});
