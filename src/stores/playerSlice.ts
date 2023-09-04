import Point2D from '@/utils/Point2D';
import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';
import { MathUtils } from 'three/src/Three';
import { LocationActionType, TileType } from '@/components/types/GameTypes';

export interface PlayerSlice {
  playerPosition: Point2D;
  playerRotation: number;
  score: number;
  adjustPlayer: (xOffset: number, yOffset: number) => boolean;
  checkPlayerLocation: () => LocationActionType;
  addScore: (score: number) => void;
  isPlayerAtExit: () => boolean;
}

export const createPlayerSlice: StateCreator<
  PlayerSlice & MapSlice,
  [],
  [],
  PlayerSlice
> = (set, get) => ({
  playerPosition: new Point2D(5, 5),
  score: 0,
  playerRotation: 0,
  adjustPlayer(xOffset: number, yOffset: number) {
    const isBlockWallOrNull = get().isBlockWallOrNull;
    const currentMapData = get().mapData;
    const playerData = get().playerPosition;
    let currentPlayerRotation = get().playerRotation;

    if (
      isBlockWallOrNull(
        currentMapData[playerData.x + xOffset][playerData.y + yOffset]
      )
    ) {
      return false;
    }

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

    set({
      playerPosition: playerData,
      playerRotation: currentPlayerRotation,
    });
    return true;
  },
  addScore(amount: number) {
    set((store) => ({ score: store.score + amount }));
  },
  isPlayerAtExit() {
    const currentMapData = get().mapData;
    const currentPlayerData = get().playerPosition;

    if (
      currentMapData[currentPlayerData.x][currentPlayerData.y] ==
      TileType.TILE_EXIT
    ) {
      return true;
    }
    return false;
  },
  checkPlayerLocation() {
    // Check for item at location
    const getItemPosition = get().getItemPosition;
    const currentPlayerData = get().playerPosition;
    const addScore = get().addScore;
    const items = get().items;
    const getItemPositionOnGrid = get().getItemPositionOnGrid;
    const isPlayerAtExit = get().isPlayerAtExit;

    if (isPlayerAtExit()) {
      return LocationActionType.AT_EXIT;
    }

    const itemAtLocation = getItemPosition(
      currentPlayerData.x,
      currentPlayerData.y
    );

    if (itemAtLocation) {
      console.log(
        'Item at location: ',
        itemAtLocation.type,
        ' - ',
        itemAtLocation.id
      );
      addScore(10);
      const oldItems = [...items];

      delete oldItems[
        getItemPositionOnGrid(currentPlayerData.x, currentPlayerData.y)
      ];
      set({ items: oldItems });

      return LocationActionType.COLLECTED_ITEM;
    }

    return LocationActionType.NOTHING;
  },
});
