import DirectionArrow from '@/components/models/DirectionArrow';
import JumpArcArrow from '@/components/models/JumpArcArrow';
import { EnemyTouchType, UnitTraits } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { Point2D } from '@/utils/Point2D';
import { PathChain, generatePathChain } from '@/utils/gridUtils';
import { VISIBLE, tileIndex } from '@/utils/visibilityUtils';
import { MathUtils } from 'three';
import { shallow } from 'zustand/shallow';

const MAX_DIRECTION_ARROWS = 60;
const MAX_JUMP_ARCS = 10;
const NULL_POINT: Point2D = { x: 0, y: 0 };

type DirectionArrowData = {
  position: [number, number, number];
  curveType: PathChain['curveType'];
  rotation: [number, number, number];
  touchType: EnemyTouchType;
};

type JumpArcData = {
  start: Point2D;
  end: Point2D;
  touchType: EnemyTouchType;
};

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

  const arrowHeight = 0.1;
  const directionArrows: DirectionArrowData[] = [];
  const jumpArcs: JumpArcData[] = [];

  if (enemies && !isDead) {
    enemies.forEach((enemy) => {
      if (enemy.movementPoints.length === 0) return;

      const isJumper = (enemy.traits & UnitTraits.JUMPER) === UnitTraits.JUMPER;

      if (isJumper) {
        const destination =
          enemy.movementPoints[enemy.movementPoints.length - 1];
        if (
          visibilityMap[tileIndex(destination.x, destination.y, numRows)] ===
          VISIBLE
        ) {
          jumpArcs.push({
            start: enemy.position,
            end: destination,
            touchType: enemy.touchType,
          });
        }
        return;
      }

      const paths = [enemy.position, ...enemy.movementPoints];
      const pathChain = generatePathChain(paths);

      pathChain.forEach((chain: PathChain) => {
        if (
          visibilityMap[
            tileIndex(chain.position.x, chain.position.y, numRows)
          ] !== VISIBLE
        ) {
          return;
        }
        directionArrows.push({
          position: [chain.position.x, arrowHeight, chain.position.y],
          curveType: chain.curveType,
          rotation: [0, MathUtils.degToRad(chain.tileRotation), 0],
          touchType: enemy.touchType,
        });
      });
    });
  }

  return (
    <>
      {Array.from({ length: MAX_DIRECTION_ARROWS }, (_, i) => {
        const data = directionArrows[i];
        return (
          <DirectionArrow
            key={`da-${i}`}
            visible={!!data}
            position={data?.position ?? [0, 0, 0]}
            curveType={data?.curveType}
            rotation={data?.rotation ?? [0, 0, 0]}
            touchType={data?.touchType ?? EnemyTouchType.TOUCHTYPE_DAMAGE}
          />
        );
      })}
      {Array.from({ length: MAX_JUMP_ARCS }, (_, i) => {
        const data = jumpArcs[i];
        return (
          <JumpArcArrow
            key={`ja-${i}`}
            visible={!!data}
            start={data?.start ?? NULL_POINT}
            end={data?.end ?? NULL_POINT}
            touchType={data?.touchType ?? EnemyTouchType.TOUCHTYPE_DAMAGE}
            arcHeight={1.0}
          />
        );
      })}
    </>
  );
};
