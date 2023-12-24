import { Html } from '@react-three/drei';
import { Vector3, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Vector3 as ThreeVector } from 'three';

interface NoticeOverlayProps {
  children: React.ReactNode;
  position?: Vector3;
}

export const NoticeOverlay = ({ children, ...props }: NoticeOverlayProps) => {
  const position = useMemo(() => props.position, [props.position]);
  const htmlRef = useRef<THREE.Group>(null);
  const floatVector = new ThreeVector(0, -0.02, 0);

  useFrame(() => {
    if (!htmlRef || !htmlRef.current) {
      return;
    }
    htmlRef.current.position.sub(floatVector);
  });

  return (
    <group ref={htmlRef} position={position} {...props}>
      <Html scale={0.75} transform sprite>
        <div className="notice-overlay">{children}</div>
      </Html>
    </group>
  );
};
