import GameObject from '@/components/entities/GameObject';
import { MoveableObject } from '@/components/entities/MoveableObject';
import { Arrow } from '@/components/models/Arrow';
import { Direction, ProjectileType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
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
        rotation = 0;
        break;
      case Direction.DIR_WEST:
        rotation = 90;
        break;
      case Direction.DIR_SOUTH:
        rotation = 180;
        break;
      case Direction.DIR_EAST:
        rotation = 270;
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
            rotation={rotation}
          >
            <MoveableObject movementDuration={350} rotationOffset={180} />
            <Arrow data={projectile} />
          </GameObject>
        );
        break;
    }
  });

  return <>{worldProjectiles}</>;
};
