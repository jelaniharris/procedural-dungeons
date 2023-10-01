import DangerIndicator from '@/components/models/DangerIndicator';
import { GameState, useStore } from '@/stores/useStore';
import { Point2D } from '@/utils/Point2D';

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

  dangerZones.forEach((dzone: Point2D, i) => {
    indicators.push(
      <DangerIndicator
        key={`dangerIndicator-${i}`}
        position={[dzone.x, indicatorHeight, dzone.y]}
      />
    );
  });
  return <>{indicators}</>;
};
