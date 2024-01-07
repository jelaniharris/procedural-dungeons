import GameObject from '@/components/entities/GameObject';
import { MoveableObject } from '@/components/entities/MoveableObject';
import { Arrow } from '@/components/models/Arrow';
import { Direction, ProjectileType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { degToRad } from 'three/src/math/MathUtils';
import { shallow } from 'zustand/shallow';

export const ArrowProjectile = () => {};

export const ShowProjectiles = () => {
  const { projectiles } = useStore(
    (store: GameState) => ({
      projectiles: store.projectiles,
    }),
    shallow
  );

  const worldProjectiles: JSX.Element[] = [];
  if (!projectiles) {
    return <></>;
  }

  console.log('[ShowProjectiles] Rendering');
  let rotation = 0;
  projectiles.forEach((projectile) => {
    const keyName = `projectile-${projectile.id}`;
    switch (projectile.travelDirection) {
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
    switch (projectile.projectileType) {
      case ProjectileType.BEAM_ARROW:
        worldProjectiles.push(
          <GameObject
            key={keyName}
            name={keyName}
            transform={projectile.worldPosition}
            rotation={[0, rotation, 0]}
          >
            <MoveableObject movementDuration={350} />
            <Arrow data={projectile} />
          </GameObject>
        );
        break;
    }
  });

  return <>{worldProjectiles}</>;
};
