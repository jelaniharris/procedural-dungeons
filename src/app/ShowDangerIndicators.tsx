import DangerIndicator from '@/components/models/DangerIndicator';
import { DangerIndicator as DangerIndicatorType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';

const indicatorHeight = 0.5;
const MAX_DANGER_INDICATORS = 20;

export const ShowDangerIndicators = () => {
  const { dangerZones, isDead } = useStore((store: GameState) => ({
    dangerZones: store.dangerZones,
    isDead: store.isDead,
  }));

  return (
    <>
      {Array.from({ length: MAX_DANGER_INDICATORS }, (_, i) => {
        const zone = !isDead ? dangerZones[i] : undefined;
        return (
          <DangerIndicator
            key={i}
            visible={!!zone}
            position={
              zone
                ? [zone.location.x, indicatorHeight, zone.location.y]
                : [0, 0, 0]
            }
            indicatorType={zone?.indicatorType ?? DangerIndicatorType.DAMAGE}
          />
        );
      })}
    </>
  );
};
