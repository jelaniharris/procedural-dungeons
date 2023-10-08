/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef } from 'react';
import nipplejs from 'nipplejs';
import { useStore } from '@/stores/useStore';
import useGame from './useGame';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GameStatus } from './types/GameTypes';

export type JoyStickData = {
  angle: string;
  distance: number;
};

export const Joystick = () => {
  const thisElement = useRef<HTMLDivElement | null>(null);
  const lastData = useRef<JoyStickData>({ distance: 0, angle: '' });
  const joystiqManager = useRef<nipplejs.JoystickManager | null>(null);
  const adjustPlayer = useStore((store) => store.adjustPlayer);
  const gameStatus = useStore((store) => store.gameStatus);
  const { publish } = useGame();

  const getDirection = (evt: any, data: any) => {
    lastData.current = {
      angle: data.direction.angle,
      distance: data.distance,
    };
  };
  console.log('Game sttus:', gameStatus);

  const getJoystickDeactivation = useCallback(() => {
    let movementValid = false;

    console.log('Direction game status:', gameStatus);

    /*if (gameStatus != GameStatus.GAME_STARTED) {
      return;
    }*/

    if (lastData.current.distance > 5) {
      switch (lastData.current.angle) {
        case 'up':
          movementValid = adjustPlayer(0, -1);
          break;
        case 'right':
          movementValid = adjustPlayer(1, 0);
          break;
        case 'left':
          movementValid = adjustPlayer(-1, 0);
          break;
        case 'down':
          movementValid = adjustPlayer(0, 1);
          break;
      }

      if (movementValid) {
        publish('player-moved', { moved: true });
      }
    } else {
      publish('player-moved', { moved: false });
    }

    lastData.current = {
      angle: '',
      distance: 0,
    };
    //setJoyData({ data });
  }, [adjustPlayer, gameStatus, publish]);

  useEffect(() => {
    console.log("I'm being RAN");
    if (!thisElement.current) {
      return;
    }
    if (!joystiqManager.current) {
      const manager = nipplejs.create({
        size: 120,
        zone: thisElement.current,
        maxNumberOfNipples: 2,
        restOpacity: 0.3,
        mode: 'static',
        threshold: 0.3,
        restJoystick: true,
        // position: { top: 20, left: 20 },
        position: { top: '75%', left: '50%' },
      });

      manager.on('dir', getDirection);
      manager.on('end', getJoystickDeactivation);

      joystiqManager.current = manager;
    }
  }, [getJoystickDeactivation]);

  /*
      style={{
      outline: '1px dashed red',
      color: 'blue',
      width: 150,
      height: 150,
      position: 'relative'
  }}*/

  return <div ref={thisElement}></div>;
};
