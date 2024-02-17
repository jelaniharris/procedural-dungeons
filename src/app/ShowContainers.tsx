import GameObject from '@/components/entities/GameObject';
import Chest from '@/components/models/Chest';
import { ItemContainerType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { shallow } from 'zustand/shallow';

export const ShowContainers = () => {
  const itemContainers = useStore((state) => state.itemContainers, shallow);

  const worldContainers: React.JSX.Element[] = [];

  itemContainers.forEach((contObj) => {
    if (!contObj) return;
    const objX = contObj.position.x;
    const objY = contObj.position.y;

    const keyName = `container-${contObj.id}:${objX},${objY}`;
    switch (contObj.type) {
      case ItemContainerType.CONTAINER_CHEST:
        worldContainers.push(
          <GameObject
            key={keyName}
            name={keyName}
            transform={{ x: objX, y: objY }}
          >
            <Chest key={keyName} container={contObj} />
          </GameObject>
        );
        break;
      default:
        break;
    }
  });

  return <>{worldContainers}</>;
};
