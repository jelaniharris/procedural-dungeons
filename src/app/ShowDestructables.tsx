import GameObject from '@/components/entities/GameObject';
import { Barrel } from '@/components/models/Barrel';
import { DestructableType } from '@/components/types/GameTypes';
import { useStore } from '@/stores/useStore';
import { Vector3 } from 'three/src/math/Vector3';

export const ShowDestructables = () => {
  const destructables = useStore((state) => state.destructables);

  const worldDestructables: React.JSX.Element[] = [];

  destructables.forEach((destObj, key) => {
    const [x, y] = key.split(',');
    const objX = parseInt(x, 10);
    const objY = parseInt(y, 10);

    const keyName = `destructable-${destObj.id}:${objX},${objY}`;
    switch (destObj.type) {
      case DestructableType.BARREL:
        worldDestructables.push(
          <GameObject
            key={keyName}
            name={keyName}
            position={new Vector3(objX, 0, objY)}
          >
            <Barrel key={keyName} />
          </GameObject>
        );
        break;
      case DestructableType.POTTERY:
      default:
        break;
    }
  });

  return <>{worldDestructables}</>;
};
