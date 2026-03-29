import DirectionArrow from '@/components/models/DirectionArrow';
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

    // Don't reveal movement plans for enemies the player can't currently see
    if (visibilityMap[tileIndex(enemy.position.x, enemy.position.y, numRows)] !== VISIBLE) {
      return;
    }

    const paths = [enemy.position, ...enemy.movementPoints];
    const pathChain = generatePathChain(paths);

    pathChain.forEach((chain: PathChain, i) => {
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
