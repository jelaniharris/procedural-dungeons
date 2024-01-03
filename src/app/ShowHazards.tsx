import GameObject from '@/components/entities/GameObject';
import { ArrowTrap } from '@/components/models/ArrowTrap';
import { SpikeTrap } from '@/components/models/SpikeTrap';
import { Direction, HazardType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { degToRad } from 'three/src/math/MathUtils';
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
  let rotation = 0;
  hazards.forEach((hazard, id) => {
    const keyName = `hazard-${id}`;
    switch (hazard.type) {
      case HazardType.TRAP_FLOOR_SPIKES:
        worldHazards.push(
          <GameObject
            key={keyName}
            name={keyName}
            transform={hazard.worldPosition}
            rotation={[0, rotation, 0]}
          >
            <SpikeTrap data={hazard} />
          </GameObject>
        );
        break;
      case HazardType.TRAP_FLOOR_ARROW:
        switch (hazard.facingDirection) {
          case Direction.DIR_NORTH:
            rotation = degToRad(0);
            break;
          case Direction.DIR_WEST:
            rotation = degToRad(90);
            break;
          case Direction.DIR_SOUTH:
            rotation = degToRad(180);
            break;
          case Direction.DIR_EAST:
            rotation = degToRad(270);
            break;
          default:
            break;
        }
        console.log('FACIN:', hazard.facingDirection);
        worldHazards.push(
          <GameObject
            key={keyName}
            name={keyName}
            transform={hazard.worldPosition}
            rotation={[0, rotation, 0]}
          >
            <ArrowTrap data={hazard} />
          </GameObject>
        );
        break;
    }
  });
  return <>{worldHazards}</>;
};
