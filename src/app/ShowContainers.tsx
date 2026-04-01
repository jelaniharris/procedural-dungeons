import { VisibleObject } from '@/app/VisibleObject';
import GameObject from '@/components/entities/GameObject';
import Chest from '@/components/models/Chest';
import { ItemContainerType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { tileIndex } from '@/utils/visibilityUtils';
import { shallow } from 'zustand/shallow';

export const ShowContainers = () => {
  const { itemContainers, visibilityMap, numRows } = useStore(
    (state) => ({
      itemContainers: state.itemContainers,
      visibilityMap: state.visibilityMap,
      numRows: state.numRows,
    }),
    shallow
  );

  const worldContainers: React.JSX.Element[] = [];

  itemContainers.forEach((contObj) => {
    if (!contObj) return;
    const objX = contObj.position.x;
    const objY = contObj.position.y;
    const visibility = visibilityMap[tileIndex(objX, objY, numRows)];

    const keyName = `container-${contObj.id}:${objX},${objY}`;
    switch (contObj.type) {
      case ItemContainerType.CONTAINER_CHEST:
        worldContainers.push(
          <VisibleObject key={keyName} visibility={visibility}>
            <GameObject name={keyName} transform={{ x: objX, y: objY }}>
              <Chest container={contObj} />
            </GameObject>
          </VisibleObject>
        );
        break;
      default:
        break;
    }
  });

  return <>{worldContainers}</>;
};
