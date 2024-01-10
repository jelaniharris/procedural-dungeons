/* eslint-disable @typescript-eslint/no-unused-vars */
import { Point2D } from '@/utils/Point2D';
import { ConsumerEvent } from '@/utils/pubSub';
import wait from '@/utils/wait';
import { Vector3 } from '@react-three/fiber';
import anime from 'animejs';
import { useEffect, useRef } from 'react';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';
import useGameObject from './useGameObject';

export interface MoveableObjectProps {
  isStatic?: boolean;
  movementDuration?: number;
}

export type MovementObjectType = 'move' | 'push' | 'jump';

export type MoveableObjectRef = ComponentRef<
  'Moveable',
  {
    move: (
      position: Point2D,
      type?: MovementObjectType,
      zOffset?: number
    ) => Promise<boolean>;
    isMoving: () => boolean;
    blockMovement: (delayMs: number) => void;
  }
>;

export type MovedEvent = ConsumerEvent<
  'moved',
  { location: Point2D; zOffset: number }
>;
export type MovingEvent = ConsumerEvent<
  'moving',
  {
    currentPosition: Vector3;
    nextPosition: Vector3;
  }
>;

export const MoveableObject = ({
  isStatic = false,
  movementDuration = 200,
}: MoveableObjectProps) => {
  const { transform, zOffset, publish, nodeRef } = useGameObject();
  const nextPosition = useRef<Vector3>([
    transform.x,
    zOffset ? zOffset : 0,
    transform.y,
  ]);
  const canMove = useRef(!isStatic);

  useComponentRegistry<MoveableObjectRef>('Moveable', {
    isMoving() {
      return !isStatic && !canMove.current;
    },
    async blockMovement(delayMs: number) {
      canMove.current = false;
      await wait(delayMs);
      canMove.current = true;
    },
    async move(targetPosition: Point2D, type, zOffset) {
      if (isStatic) return false;
      if (!canMove.current) return false;

      const isJumping = type === 'jump';
      const isPushed = type === 'push';
      const isForced = isJumping || isPushed;

      const targetPosition3D: Vector3 = [
        targetPosition.x,
        zOffset ? zOffset : 0,
        targetPosition.y,
      ];

      nextPosition.current = targetPosition3D;

      const fromX = transform.x;
      const fromY = transform.y;
      const fromZ = 0;
      const toX = targetPosition.x;
      const toY = targetPosition.y;
      const toZ = zOffset ? zOffset : 0;

      canMove.current = false;

      // Prevent stacking and interrupting of animation
      if (nodeRef.current) {
        anime.remove(nodeRef.current?.position);
      }

      await anime({
        targets: nodeRef.current?.position,
        x: [fromX, toX],
        z: [fromY, toY],
        y: [fromZ, toZ],
        duration: movementDuration,
        easing: 'linear',
        begin() {
          transform.x = targetPosition.x;
          transform.y = targetPosition.y;
        },
        update() {
          //console.log('Animating?');
          if (nodeRef.current && !isForced) {
            publish<MovingEvent>('moving', {
              currentPosition: nodeRef.current?.position,
              nextPosition: targetPosition3D,
            });
          }
        },
      }).finished;

      canMove.current = true;

      // Published moved event
      !isForced &&
        publish<MovedEvent>('moved', {
          location: {
            x: targetPosition3D[0],
            y: targetPosition3D[2],
          },
          zOffset: zOffset ? zOffset : 0,
        });
      return true;
    },
  });

  useEffect(() => {
    const node = nodeRef.current;
    return () => {
      if (node) {
        anime.remove(node.position);
      }
    };
  }, [nodeRef]);

  return null;
};
