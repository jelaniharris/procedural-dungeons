import DangerIndicator from '@/components/models/DangerIndicator';
import { DangerType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';

const indicatorHeight = 0.5;

export const ShowDangerIndicators = () => {
  const { dangerZones, isDead } = useStore((store: GameState) => ({
    dangerZones: store.dangerZones,
    isDead: store.isDead,
  }));

  const indicators: JSX.Element[] = [];
  if (!dangerZones || isDead) {
    return <></>;
  }

  dangerZones.forEach((dzone: DangerType, i) => {
    indicators.push(
      <DangerIndicator
        key={`dangerIndicator-${i}`}
        position={[dzone.location.x, indicatorHeight, dzone.location.y]}
        indicatorType={dzone.indicatorType}
      />
    );
  });
  return <>{indicators}</>;
};
