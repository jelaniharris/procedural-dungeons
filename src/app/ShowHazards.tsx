import { VisibleObject } from '@/app/VisibleObject';
import GameObject from '@/components/entities/GameObject';
import { ArrowTrap } from '@/components/models/ArrowTrap';
import { BladeTrap } from '@/components/models/traps/BladeTrap';
import { FloorGrates } from '@/components/models/FloorGrates';
import { SpikeTrap } from '@/components/models/SpikeTrap';
import { Direction, HazardType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { tileIndex } from '@/utils/visibilityUtils';
import { JSX } from 'react';
import { shallow } from 'zustand/shallow';

export const ShowHazards = () => {
  const { hazards, visibilityMap, numRows } = useStore(
    (store: GameState) => ({
      hazards: store.hazards,
      visibilityMap: store.visibilityMap,
      numRows: store.numRows,
    }),
    shallow
  );

  const worldHazards: JSX.Element[] = [];
  if (!hazards) {
    return <></>;
  }

  let rotation = 0;
  hazards.forEach((hazard, id) => {
    const keyName = `hazard-${id}-${hazard.id}`;
    const visibility = visibilityMap[tileIndex(hazard.worldPosition.x, hazard.worldPosition.y, numRows)];

    let hazardElement: JSX.Element | null = null;
    switch (hazard.type) {
      case HazardType.TRAP_FLOOR_GRATES:
        hazardElement = (
          <GameObject name={keyName} transform={hazard.worldPosition} rotation={rotation}>
            <FloorGrates data={hazard} />
          </GameObject>
        );
        break;
      case HazardType.TRAP_FLOOR_SPIKES:
        hazardElement = (
          <GameObject name={keyName} transform={hazard.worldPosition} rotation={rotation}>
            <SpikeTrap data={hazard} />
          </GameObject>
        );
        break;
      case HazardType.TRAP_BLADE:
        hazardElement = (
          <GameObject name={keyName} transform={hazard.worldPosition} rotation={0}>
            <BladeTrap data={hazard} />
          </GameObject>
        );
        break;
      case HazardType.TRAP_FLOOR_ARROW:
        switch (hazard.facingDirection) {
          case Direction.DIR_NORTH:
            rotation = 0;
            break;
          case Direction.DIR_WEST:
            rotation = 90;
            break;
          case Direction.DIR_SOUTH:
            rotation = 180;
            break;
          case Direction.DIR_EAST:
            rotation = 270;
            break;
          default:
            break;
        }
        hazardElement = (
          <GameObject name={keyName} transform={hazard.worldPosition} rotation={rotation}>
            <ArrowTrap data={hazard} />
          </GameObject>
        );
        break;
    }

    if (hazardElement) {
      worldHazards.push(
        <VisibleObject key={keyName} visibility={visibility}>
          {hazardElement}
        </VisibleObject>
      );
    }
  });
  return <>{worldHazards}</>;
};
