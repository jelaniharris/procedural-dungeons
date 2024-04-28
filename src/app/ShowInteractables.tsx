import GameObject from '@/components/entities/GameObject';
import Door from '@/components/models/Door';
import { DoorLocation, TileType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { shallow } from 'zustand/shallow';

export const ShowInteractables = () => {
  const { doors, determineWallType } = useStore(
    (state) => ({
      doors: state.doors,
      determineWallType: state.determineWallType,
    }),
    shallow
  );

  const worldDoors: React.JSX.Element[] = [];

  console.log('[ShowInteractables] Rendering');

  doors.forEach((door: DoorLocation) => {
    const { rotation } = determineWallType(
      door.position.x,
      door.position.y,
      TileType.TILE_WALL_DOOR
    );

    const keyName = `door:${door.position.x},${door.position.y}`;
    worldDoors.push(
      <GameObject
        key={keyName}
        name={keyName}
        transform={door.position}
        rotation={rotation}
      >
        <Door key={keyName} />
      </GameObject>
    );
  });

  return <>{worldDoors}</>;
};
