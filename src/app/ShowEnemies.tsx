import { Gas } from '@/components/models/Gas';
import { Skull } from '@/components/models/Skull';
import { Ghost } from '@/components/models/characters/CharacterGhost';
import { Orc } from '@/components/models/characters/CharacterOrc';
import { Skeleton } from '@/components/models/characters/CharacterSkeleton';
import { EnemyStatus, EnemyType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { getGasFromEnemyType } from '@/utils/hazardUtils';
import { useRef } from 'react';
import { Vector3 } from 'three';

export const ShowEnemies = () => {
  const { enemies } = useStore((store: GameState) => ({
    enemies: store.enemies,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enemiesRef = useRef<any[]>([]);

  const worldEnemies: JSX.Element[] = [];
  if (!enemies) {
    return <></>;
  }

  enemies.forEach((enemy) => {
    if (enemy && enemy.id >= 0) {
      let enemyElement;

      if (enemy.status == EnemyStatus.STATUS_DEAD && enemy.leavesCorpse) {
        enemyElement = (
          <Skull
            key={`${enemy.name}-${enemy.id}`}
            position={new Vector3(enemy.position.x, 0, enemy.position.y)}
          />
        );
      } else {
        switch (enemy.type) {
          case EnemyType.ENEMY_ORC:
            enemyElement = (
              <Orc
                key={`${enemy.name}-${enemy.id}`}
                position={new Vector3(enemy.position.x, 0, enemy.position.y)}
                enemy={enemy}
                enemyId={enemy.id}
                ref={(el) => {
                  if (el) {
                    enemiesRef.current[enemy.id] = el;
                  }
                }}
              />
            );
            break;
          case EnemyType.ENEMY_SKELETON:
            enemyElement = (
              <Skeleton
                key={`${enemy.name}-${enemy.id}`}
                position={new Vector3(enemy.position.x, 0, enemy.position.y)}
                enemy={enemy}
                enemyId={enemy.id}
                ref={(el) => {
                  if (el) {
                    enemiesRef.current[enemy.id] = el;
                  }
                }}
              />
            );
            break;
          case EnemyType.ENEMY_GHOST:
            enemyElement = (
              <Ghost
                key={`${enemy.name}-${enemy.id}`}
                position={new Vector3(enemy.position.x, 0, enemy.position.y)}
                enemy={enemy}
                enemyId={enemy.id}
                ref={(el) => {
                  if (el) {
                    enemiesRef.current[enemy.id] = el;
                  }
                }}
              />
            );
            break;
          case EnemyType.ENEMY_GAS_CONFUSION:
          case EnemyType.ENEMY_GAS_POISON:
            const gasType = getGasFromEnemyType(enemy.type);

            enemyElement = (
              <Gas
                key={`${enemy.name}-${enemy.id}`}
                position={new Vector3(enemy.position.x, 0, enemy.position.y)}
                enemy={enemy}
                enemyId={enemy.id}
                gasType={gasType}
                ref={(el) => {
                  if (el) {
                    enemiesRef.current[enemy.id] = el;
                  }
                }}
              />
            );
            break;
          default:
            return;
        }
      }

      worldEnemies.push(enemyElement);
    }
  });
  return <>{worldEnemies}</>;
};
