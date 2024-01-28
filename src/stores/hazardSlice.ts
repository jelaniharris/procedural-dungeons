import {
  DIRECTIONS,
  Hazard,
  HazardType,
  LiquidType,
  TileType,
} from '@/components/types/GameTypes';
import { LootChance } from '@/utils/LootChance';
import { Point2D } from '@/utils/Point2D';
import { v4 as uuidv4 } from 'uuid';
import { StateCreator } from 'zustand';
import { GeneratorSlice } from './generatorSlice';
import { MapSlice } from './mapSlice';
import { PlayerSlice } from './playerSlice';
import { StageSlice } from './stageSlice';

export interface HazardSlice {
  hazards: Map<string, Hazard>;
  generateHazards: (seed: number) => void;
  playerInDamageZone: (position: Point2D[]) => boolean;
  locationHasHazard: (location: Point2D) => Hazard | null;
}

export const createHazardSlice: StateCreator<
  HazardSlice & MapSlice & StageSlice & PlayerSlice & GeneratorSlice,
  [],
  [],
  HazardSlice
> = (set, get) => ({
  hazards: new Map<string, Hazard>(),
  generateHazards(seed: number) {
    let emptySpots = get().getEmptyTiles();
    const currentLevel = get().currentLevel;
    const currentMapData = get().mapData;
    const locationLiquidType = get().locationLiquidType;
    const psuedoShuffle = get().shuffleArray;
    const randomGen = get().generateGenerator(seed);
    emptySpots = psuedoShuffle(emptySpots, randomGen);

    const newHazardData = new Map<string, Hazard>();

    const lootGen = new LootChance<HazardType>();
    lootGen.add(HazardType.TRAP_FLOOR_SPIKES, 50);
    lootGen.add(HazardType.TRAP_FLOOR_ARROW, 50);

    let numberHazards = 6 + currentLevel * 4;

    const doorLocations = get().getAllDoorLocations();

    while (emptySpots.length != 0 && numberHazards > 0) {
      const point = emptySpots.shift();
      if (!point) {
        break;
      }

      // Do not generate traps on an exit point
      if (currentMapData[point.x][point.y] == TileType.TILE_EXIT) {
        continue;
      }

      // Choose the random item
      const randomTrap = lootGen.choose(randomGen);

      // Do not generate traps in doors
      if (
        doorLocations.has(`${point.x},${point.y}`) &&
        HazardType.TRAP_FLOOR_ARROW === randomTrap
      ) {
        continue;
      }

      // Do not generate traps on top of liquids
      if (locationLiquidType(point) != LiquidType.LIQUID_NONE) {
        continue;
      }

      let newHazard: Hazard = {
        id: uuidv4(),
        type: randomTrap === null ? HazardType.TRAP_NONE : randomTrap,
        worldPosition: point,
        isActive: false,
        currentPhase: 2,
        maxPhase: 2,
      };

      switch (randomTrap) {
        case HazardType.TRAP_FLOOR_ARROW:
          const randomDirection = psuedoShuffle(DIRECTIONS, randomGen)[0];
          newHazard = {
            ...newHazard,
            name: 'Arrow Trap',
            facingDirection: randomDirection,
          };
          break;
        case HazardType.TRAP_FLOOR_SPIKES:
          newHazard = {
            ...newHazard,
            name: 'Spike Trap',
          };
          break;
      }

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
  locationHasHazard(location: Point2D) {
    const hazards = get().hazards;
    let foundHazard: Hazard | null = null;
    hazards.forEach((val) => {
      if (
        val.worldPosition.x === location.x &&
        val.worldPosition.y === location.y
      ) {
        foundHazard = val;
        return val;
      }
    });
    return foundHazard;
  },
});
