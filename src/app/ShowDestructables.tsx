import { VisibleObject } from '@/app/VisibleObject';
import GameObject from '@/components/entities/GameObject';
import { Barrel } from '@/components/models/Barrel';
import { DestructableType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { tileIndex } from '@/utils/visibilityUtils';
import { shallow } from 'zustand/shallow';

export const ShowDestructables = () => {
  const { destructables, visibilityMap, numRows } = useStore(
    (state) => ({
      destructables: state.destructables,
      visibilityMap: state.visibilityMap,
      numRows: state.numRows,
    }),
    shallow
  );

  const worldDestructables: React.JSX.Element[] = [];

  destructables.forEach((destObj, key) => {
    const [x, y] = key.split(',');
    const objX = parseInt(x, 10);
    const objY = parseInt(y, 10);
    const visibility = visibilityMap[tileIndex(objX, objY, numRows)];

    const keyName = `destructable-${destObj.id}:${objX},${objY}`;
    switch (destObj.type) {
      case DestructableType.BARREL:
        worldDestructables.push(
          <VisibleObject key={keyName} visibility={visibility}>
            <GameObject name={keyName} transform={{ x: objX, y: objY }}>
              <Barrel />
            </GameObject>
          </VisibleObject>
        );
        break;
      case DestructableType.POTTERY:
      default:
        break;
    }
  });

  return <>{worldDestructables}</>;
};
