import { useFrame } from '@react-three/fiber';
import { RefObject } from 'react';
import * as THREE from 'three';

const MOVE_THRESHOLD = 0.2;
const Y_LERP_SPEED = 0.15;

export function useEnemyMovement<T extends string>(
  ref: RefObject<THREE.Group>,
  target: THREE.Vector3 | undefined,
  yOffset: number,
  movementPoints: unknown[],
  setAnimation: (anim: T) => void,
  walkAnim: T,
  idleAnim: T,
  movementSpeed: number
) {
  useFrame(() => {
    if (!ref.current || !target) return;

    const targetPos = target as THREE.Vector3;
    const dx = ref.current.position.x - targetPos.x;
    const dz = ref.current.position.z - targetPos.z;
    const xzDist = Math.sqrt(dx * dx + dz * dz);

    if (xzDist > MOVE_THRESHOLD) {
      const direction = new THREE.Vector3(dx, 0, dz)
        .normalize()
        .multiplyScalar(movementSpeed);
      ref.current.position.sub(direction);
      const lookTarget = targetPos.clone();
      lookTarget.y = ref.current.position.y;
      ref.current.lookAt(lookTarget);
      setAnimation(walkAnim);
    } else {
      setAnimation(movementPoints.length > 0 ? walkAnim : idleAnim);
    }

    ref.current.position.y = THREE.MathUtils.lerp(
      ref.current.position.y,
      yOffset,
      Y_LERP_SPEED
    );
  });
}
