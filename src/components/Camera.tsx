import { PerspectiveCamera } from '@react-three/drei';

const Camera = () => {
  return (
    <PerspectiveCamera
      makeDefault={true}
      fov={60}
      position={[0, 10, 0]}
      rotation={[0, 0, 0]}
    />
  );
};

export default Camera;
