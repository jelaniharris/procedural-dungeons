import { Orc } from '@/components/models/characters/Character-orc';
import { GameState, useStore } from '@/stores/useStore';
import { useRef } from 'react';
import { shallow } from 'zustand/shallow';

export const ShowEnemies = () => {
  const { enemies } = useStore((store: GameState) => ({
    enemies: store.enemies,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const enemiesRef = useRef<any[]>([]);

  console.log('Showing enemies');

  const worldEnemies: JSX.Element[] = [];
  if (!enemies) {
    return <></>;
  }

  enemies.forEach((enemy) => {
    if (enemy && enemy.id) {
      worldEnemies.push(
        <Orc
          key={`${enemy.name}-${enemy.id}`}
          enemy={enemy}
          enemyId={enemy.id}
          ref={(el) => {
            if (el) {
              enemiesRef.current[enemy.id] = el;
            }
          }}
        />
      );
    }
  });
  return <>{worldEnemies}</>;
};
