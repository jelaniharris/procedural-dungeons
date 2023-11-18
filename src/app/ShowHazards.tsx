import GameObject from '@/components/entities/GameObject';
import { SpikeTrap } from '@/components/models/SpikeTrap';
import { HazardType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { shallow } from 'zustand/shallow';

export const ShowHazards = () => {
  const { hazards } = useStore(
    (store: GameState) => ({
      hazards: store.hazards,
    }),
    shallow
  );

  const worldHazards: JSX.Element[] = [];
  if (!hazards) {
    return <></>;
  }

  console.log('[ShowHazards] Rendering');

  hazards.forEach((hazard, id) => {
    const keyName = `hazard-${id}`;
    switch (hazard.type) {
      case HazardType.TRAP_FLOOR_SPIKES:
        worldHazards.push(
          <GameObject
            key={keyName}
            name={keyName}
            transform={hazard.worldPosition}
          >
            <SpikeTrap data={hazard} />
          </GameObject>
        );
        break;
    }
  });
  return <>{worldHazards}</>;
};
