import DirectionArrow from '@/components/models/DirectionArrow';
import { GameState, useStore } from '@/stores/useStore';
import { PathChain, generatePathChain } from '@/utils/gridUtils';
import { MathUtils } from 'three';

export const ShowEnemyIntention = () => {
  const { enemies, isDead } = useStore((store: GameState) => ({
    enemies: store.enemies,
    isDead: store.isDead,
  }));

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
    const paths = [enemy.position, ...enemy.movementPoints];
    const pathChain = generatePathChain(paths);

    pathChain.forEach((chain: PathChain, i) => {
      intentions.push(
        <DirectionArrow
          key={`intention-${enemy.name}-${enemy.id}-${i}`}
          position={[chain.position.x, arrowHeight, chain.position.y]}
          curveType={chain.curveType}
          rotation={[0, MathUtils.degToRad(chain.tileRotation), 0]}
        />
      );
    });
  });
  return <>{intentions}</>;
};
