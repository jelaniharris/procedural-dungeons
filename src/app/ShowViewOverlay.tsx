import { StatusEffectType } from '@/components/types/GameTypes';
import { GameState, useStore } from '@/stores/useStore';
import { Hud, OrthographicCamera } from '@react-three/drei';
import { useMemo } from 'react';

export const ShowViewOverlay = () => {
  //const { viewport } = useThree();
  const hasStatusEffect = useStore((state: GameState) => state.hasStatusEffect);
  const statusEffects = useStore((state: GameState) => state.statusEffects);

  const isTired = useMemo(() => {
    if (statusEffects.length > 0) {
      return hasStatusEffect(StatusEffectType.STARVING) !== undefined;
    }
    return false;
  }, [hasStatusEffect, statusEffects]);

  /*useEffect(() => {
    camera.add(
      <mesh>
        <planeBufferGeometry attach="geometry" args={[25, 15]} />
        <meshPhongMaterial attach="material" color="green" />
      </mesh>
    );
  });*/

  /*scale={[viewport.width, viewport.height, 1]}*/

  /*
        <mesh>
        <boxGeometry args={[100, 100, 60]} />
        <meshStandardMaterial
          attach="material"
          color={'green'}
          wireframe
          side={DoubleSide}
        />
      </mesh>
      */

  return (
    <Hud>
      <OrthographicCamera
        makeDefault
        left={-0.5}
        right={0.5}
        top={0.5}
        bottom={-0.5}
        near={-10}
        far={10}
        position={[0, 0, 5]}
      >
        <ambientLight intensity={0.75} />
        <mesh visible={isTired === true}>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            attach="material"
            opacity={0.5}
            transparent={true}
            color={'purple'}
          />
        </mesh>
      </OrthographicCamera>
    </Hud>
  );
};

/*import { OrthographicCamera } from '@react-three/drei';
import { createPortal, useFrame, useThree } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import { Matrix4, Mesh, Scene } from 'three';

export const ShowViewOverlay = () => {
  const { gl, scene, camera, size } = useThree();
  const virtualScene = useMemo(() => new Scene(), []);
  const virtualCam = useRef<THREE.OrthographicCamera>(null);
  const ref = useRef<Mesh>(null);
  let matrix = new Matrix4();

  useFrame(() => {
    if (!virtualCam || !virtualCam.current || !ref || !ref.current) return;
    matrix = camera.matrix.invert(); // matrix.getInverse(camera.matrix);
    ref.current.quaternion.setFromRotationMatrix(matrix);
    gl.autoClear = true;
    gl.render(scene, camera);
    gl.autoClear = false;
    gl.clearDepth();
    gl.render(virtualScene, virtualCam.current);
  }, 1);

  if (!virtualCam || !virtualCam.current) return;

  return createPortal(
    <>
      <OrthographicCamera
        ref={virtualCam}
        makeDefault={false}
        position={[0, 0, 100]}
      >
        <mesh
          ref={ref}
          position={[size.width / 2 - 80, size.height / 2 - 80, 0]}
        >
          <boxBufferGeometry attach="geometry" args={[60, 60, 60]} />
        </mesh>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
      </OrthographicCamera>
    </>,
    virtualScene
  );
};*/
