import { Player } from './models/characters/Player';
import { useKeyboardControls } from '@react-three/drei';
import { Controls } from './types/GameTypes';
import { useStore } from '@/stores/useStore';

type CharacterControllerProps = {
  movementCallback: (moved: boolean) => void;
};

const CharacterListener = ({
  movementCallback,
}: {
  movementCallback: (moved: boolean) => void;
}) => {
  const adjustPlayer = useStore((store) => store.adjustPlayer);

  const forwardPressed = useKeyboardControls<Controls>(
    (state) => state.forward
  );
  const rightPressed = useKeyboardControls<Controls>((state) => state.right);
  const leftPressed = useKeyboardControls<Controls>((state) => state.left);
  const downPressed = useKeyboardControls<Controls>((state) => state.back);

  //console.log(forward);
  let movementValid = false;

  if (adjustPlayer) {
    if (forwardPressed) {
      movementValid = adjustPlayer(0, -1);
      //SetLastRotation(MathUtils.degToRad(0));
    } else if (downPressed) {
      movementValid = adjustPlayer(0, 1);
      //SetLastRotation(MathUtils.degToRad(180));
    } else if (rightPressed) {
      movementValid = adjustPlayer(1, 0);
      //SetLastRotation(MathUtils.degToRad(90));
    } else if (leftPressed) {
      movementValid = adjustPlayer(-1, 0);
      //SetLastRotation(MathUtils.degToRad(270));
    }
  }

  if (
    movementValid &&
    (forwardPressed || downPressed || rightPressed || leftPressed)
  ) {
    if (movementCallback) {
      movementCallback(movementValid);
    }
  }

  return <Player />;
};

export const CharacterController = ({
  movementCallback,
}: CharacterControllerProps) => {
  return <CharacterListener movementCallback={movementCallback} />;
};
