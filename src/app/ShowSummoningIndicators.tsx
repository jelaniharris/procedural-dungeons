import GameObject from '@/components/entities/GameObject';
import SummoningIndicator from '@/components/models/SummoningIndicator';
import { GameState, useStore } from '@/stores/useStore';
import { shallow } from 'zustand/shallow';

export const ShowSummoningIndicators = () => {
  const { spawnWarnings } = useStore(
    (store: GameState) => ({
      spawnWarnings: store.spawnWarnings,
    }),
    shallow
  );

  const worldSummons: JSX.Element[] = [];
  if (!spawnWarnings) {
    return <></>;
  }

  spawnWarnings.forEach((warning, id) => {
    const keyName = `warnings-${id}`;
    worldSummons.push(
      <GameObject key={keyName} name={keyName} transform={warning.location}>
        <SummoningIndicator spawnWarning={warning} />
      </GameObject>
    );
  });

  return <>{worldSummons}</>;
};
