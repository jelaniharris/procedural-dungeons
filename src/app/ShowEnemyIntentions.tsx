import DirectionArrow from '@/components/models/DirectionArrow';
import JumpArcArrow from '@/components/models/JumpArcArrow';
import { UnitTraits } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { PathChain, generatePathChain } from '@/utils/gridUtils';
import { VISIBLE, tileIndex } from '@/utils/visibilityUtils';
import { MathUtils } from 'three';
import { shallow } from 'zustand/shallow';

export const ShowEnemyIntention = () => {
  const { enemies, isDead, visibilityMap, numRows } = useStore(
    (store: GameState) => ({
      enemies: store.enemies,
      isDead: store.isDead,
      visibilityMap: store.visibilityMap,
      numRows: store.numRows,
    }),
    shallow
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //const enemiesRef = useRef<any[]>([]);

  const intentions: JSX.Element[] = [];
  if (!enemies || isDead) {
    return <></>;
  }

  const arrowHeight = 0.1;

  enemies.forEach((enemy) => {
    // If no enemy assigned, or isn't moving then move on
    if (enemy.movementPoints.length == 0) {
      return;
    }

    const isJumper = (enemy.traits & UnitTraits.JUMPER) === UnitTraits.JUMPER;

    if (isJumper) {
      const destination = enemy.movementPoints[enemy.movementPoints.length - 1];

      // Check if the destination is visible before showing the jump arc, since jumpers can move through walls and other obstacles
      if (
        visibilityMap[tileIndex(destination.x, destination.y, numRows)] !==
        VISIBLE
      ) {
        return;
      }

      intentions.push(
        <JumpArcArrow
          key={`jump-intention-${enemy.name}-${enemy.id}`}
          start={enemy.position}
          end={destination}
          touchType={enemy.touchType}
          arcHeight={1.0}
        />
      );
      return;
    }

    const paths = [enemy.position, ...enemy.movementPoints];
    const pathChain = generatePathChain(paths);

    pathChain.forEach((chain: PathChain, i) => {
      // If this point in the chain isn't visible, skip it and all subsequent points since intentions are only shown for the visible portion of the path
      if (
        visibilityMap[
          tileIndex(chain.position.x, chain.position.y, numRows)
        ] !== VISIBLE
      ) {
        return;
      }

      intentions.push(
        <DirectionArrow
          key={`intention-${enemy.name}-${enemy.id}-${i}`}
          position={[chain.position.x, arrowHeight, chain.position.y]}
          curveType={chain.curveType}
          rotation={[0, MathUtils.degToRad(chain.tileRotation), 0]}
          touchType={enemy.touchType}
        />
      );
    });
  });
  return <>{intentions}</>;
};
