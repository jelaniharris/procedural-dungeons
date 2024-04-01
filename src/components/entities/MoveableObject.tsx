/* eslint-disable @typescript-eslint/no-unused-vars */
import { useStore } from '@/stores/useStore';
import { Point2D } from '@/utils/Point2D';
import { ConsumerEvent } from '@/utils/pubSub';
import wait from '@/utils/wait';
import { Vector3 } from '@react-three/fiber';
import anime from 'animejs';
import { useEffect, useRef } from 'react';
import { degToRad } from 'three/src/math/MathUtils';
import useComponentRegistry, { ComponentRef } from './useComponentRegistry';
import useGameObject from './useGameObject';

export interface MoveableObjectProps {
  isStatic?: boolean;
  movementDuration?: number;
  rotationDuration?: number;
  rotationOffset?: number;
}

export type MovementObjectType = 'move' | 'push' | 'jump';

export type MoveableObjectRef = ComponentRef<
  'Moveable',
  {
    move: (
      position: Point2D,
      type?: MovementObjectType,
      zOffset?: number,
      rotationOffset?: number
    ) => Promise<boolean>;
    isMoving: () => boolean;
    blockMovement: (delayMs: number) => void;
  }
>;

export type MovedEvent = ConsumerEvent<
  'moved',
  { location: Point2D; rotation: number; zOffset: number }
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
  rotationDuration = 100,
  rotationOffset,
}: MoveableObjectProps) => {
  const { transform, rotation, zOffset, publish, nodeRef } = useGameObject();
  const getFloorZOffset = useStore((state) => state.getFloorZOffset);
  const getPlayerZOffset = useStore((state) => state.getPlayerZOffset);
  const nextPosition = useRef<Vector3>([
    transform.x,
    zOffset ? zOffset : 0,
    transform.y,
  ]);
  const nextRotation = useRef(rotation);
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
    async move(targetPosition: Point2D, type, targetZOffset) {
      if (isStatic) return false;
      if (!canMove.current) return false;

      const isJumping = type === 'jump';
      const isPushed = type === 'push';
      const isForced = isJumping || isPushed;

      const currentZOffset = getPlayerZOffset();

      const targetPosition3D: Vector3 = [
        targetPosition.x,
        targetZOffset ? targetZOffset : 0,
        targetPosition.y,
      ];
      let targetRotation: number = 0;

      nextPosition.current = targetPosition3D;

      const xOffset = targetPosition.x - transform.x;
      const yOffset = targetPosition.y - transform.y;

      // This is specifically for the player, but might work with other
      // game objects facing the same direction
      if (xOffset < 0) {
        targetRotation = 270;
      } else if (xOffset > 0) {
        targetRotation = 90;
      }

      if (yOffset < 0) {
        targetRotation = 180;
      } else if (yOffset > 0) {
        targetRotation = 0;
      }
      targetRotation += rotationOffset ?? 0;

      nextRotation.current = targetRotation;

      const fromX = transform.x;
      const fromY = transform.y;
      const fromZ = currentZOffset ? currentZOffset : 0;
      const toX = targetPosition.x;
      const toY = targetPosition.y;
      const toZ = targetZOffset ?? 0;

      const fromRotation = degToRad(rotation ?? 0);
      const toRotation = degToRad(targetRotation);

      canMove.current = false;

      // Prevent stacking and interrupting of animation
      if (nodeRef.current) {
        anime.remove(nodeRef.current?.position);
      }

      await Promise.all([
        anime({
          targets: nodeRef.current?.rotation,
          y: [fromRotation, toRotation],
          duration: rotationDuration,
          easing: 'linear',
          update() {
            console.log('Rotation happening');
          },
        }).finished,

        anime({
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
        }).finished,
      ]);

      canMove.current = true;

      // Published moved event
      !isForced &&
        publish<MovedEvent>('moved', {
          location: {
            x: targetPosition3D[0],
            y: targetPosition3D[2],
          },
          rotation: targetRotation,
          zOffset: targetZOffset ? targetZOffset : 0,
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
