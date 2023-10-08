import { Hazard, HazardType, TileType } from '@/components/types/GameTypes';
import { StateCreator } from 'zustand';
import { MapSlice } from './mapSlice';
import { StageSlice } from './stageSlice';
import { v4 as uuidv4 } from 'uuid';
import { Point2D } from '@/utils/Point2D';
import { PlayerSlice } from './playerSlice';
import { GeneratorSlice } from './generatorSlice';

export interface HazardSlice {
  hazards: Map<string, Hazard>;
  generateHazards: () => void;
  playerInDamageZone: (position: Point2D[]) => boolean;
}

export const createHazardSlice: StateCreator<
  HazardSlice & MapSlice & StageSlice & PlayerSlice & GeneratorSlice,
  [],
  [],
  HazardSlice
> = (set, get) => ({
  hazards: new Map<string, Hazard>(),
  generateHazards() {
    let emptySpots = get().getEmptyTiles();
    const currentLevel = get().currentLevel;
    const currentMapData = get().mapData;
    const psuedoShuffle = get().shuffleArray;
    emptySpots = psuedoShuffle(emptySpots);

    const newHazardData = new Map<string, Hazard>();

    let numberHazards = 10 + currentLevel * 3;
    while (emptySpots.length != 0 && numberHazards > 0) {
      const point = emptySpots.shift();
      if (!point) {
        break;
      }

      // Do not generate enemies on an exit point
      if (currentMapData[point.x][point.y] == TileType.TILE_EXIT) {
        continue;
      }

      const newHazard: Hazard = {
        id: uuidv4(),
        type: HazardType.TRAP_FLOOR_SPIKES,
        worldPosition: point,
        name: 'Spike Trap',
        isActive: false,
        currentPhase: 2,
        maxPhase: 2,
      };

      newHazardData.set(newHazard.id, newHazard);
      numberHazards--;
    }

    set({
      hazards: newHazardData,
    });
  },
  playerInDamageZone(position: Point2D[]): boolean {
    const playerPosition = get().playerPosition;

    let inZone = false;
    for (const zonePosition of position) {
      if (
        playerPosition.x == zonePosition.x &&
        playerPosition.y == zonePosition.y
      ) {
        inZone = true;
        break;
      }
    }

    return inZone;
  },
});
