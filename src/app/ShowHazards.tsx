import GameObject from '@/components/entities/GameObject';
import { SpikeTrap } from '@/components/models/SpikeTrap';
import { HazardType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { Vector3 } from 'three';

export const ShowHazards = () => {
  const { hazards } = useStore((store: GameState) => ({
    hazards: store.hazards,
  }));

  const worldHazards: JSX.Element[] = [];
  if (!hazards) {
    return <></>;
  }

  hazards.forEach((hazard, id) => {
    const keyName = `hazard-${id}`;
    switch (hazard.type) {
      case HazardType.TRAP_FLOOR_SPIKES:
        worldHazards.push(
          <GameObject
            key={keyName}
            name={keyName}
            position={
              new Vector3(hazard.worldPosition.x, 0, hazard.worldPosition.y)
            }
          >
            <SpikeTrap data={hazard} />
          </GameObject>
        );
        break;
    }
  });
  return <>{worldHazards}</>;
};
