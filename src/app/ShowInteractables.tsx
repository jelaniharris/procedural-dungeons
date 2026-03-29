import { VisibleObject } from '@/app/VisibleObject';
import GameObject from '@/components/entities/GameObject';
import Door from '@/components/models/Door';
import { DoorLocation, TileType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { EXPLORED_TINT } from '@/app/EnvironmentTile';
import { EXPLORED, tileIndex } from '@/utils/visibilityUtils';
import { shallow } from 'zustand/shallow';

export const ShowInteractables = () => {
  const { doors, determineWallType, visibilityMap, numRows } = useStore(
    (state) => ({
      doors: state.doors,
      determineWallType: state.determineWallType,
      visibilityMap: state.visibilityMap,
      numRows: state.numRows,
    }),
    shallow
  );

  const worldDoors: React.JSX.Element[] = [];

  doors.forEach((door: DoorLocation) => {
    const { rotation } = determineWallType(
      door.position.x,
      door.position.y,
      TileType.TILE_WALL_DOOR
    );

    const visibility =
      visibilityMap[tileIndex(door.position.x, door.position.y, numRows)];
    const keyName = `door:${door.position.x},${door.position.y}`;
    worldDoors.push(
      <VisibleObject
        key={keyName}
        visibility={visibility}
        visibleExplored={true}
      >
        <GameObject
          name={keyName}
          transform={door.position}
          rotation={rotation}
        >
          <Door tint={visibility === EXPLORED ? EXPLORED_TINT : undefined} />
        </GameObject>
      </VisibleObject>
    );
  });

  return <>{worldDoors}</>;
};
