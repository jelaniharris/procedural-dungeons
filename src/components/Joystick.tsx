'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameState, useStore } from '@/stores/useStore';
import nipplejs from 'nipplejs';
import { useCallback, useEffect, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import { GameStatus } from './types/GameTypes';
import useGame from './useGame';

export type JoyStickData = {
  angle: string;
  distance: number;
};

const Joystick = () => {
  const thisElement = useRef<HTMLDivElement | null>(null);
  const lastData = useRef<JoyStickData>({ distance: 0, angle: '' });
  const joystickManager = useRef<nipplejs.JoystickManager | null>(null);
  const adjustPlayer = useStore((store) => store.adjustPlayer);
  const gameStatus = useStore((store) => store.gameStatus, shallow);
  const isPaused = useStore((store: GameState) => store.isPaused, shallow);

  const { publish } = useGame();

  const getDirection = (evt: any, data: any) => {
    lastData.current = {
      angle: data.direction.angle,
      distance: data.distance,
    };
  };

  const getJoystickDeactivation = useCallback(() => {
    let movementValid = false;

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
    if (!thisElement.current) {
      return;
    }

    if (!joystickManager.current) {
      const manager = nipplejs.create({
        size: 140,
        zone: thisElement.current,
        maxNumberOfNipples: 1,
        restOpacity: 0.4,
        mode: 'static',
        threshold: 0.3,
        restJoystick: true,
        dynamicPage: true,
        position: { top: '80%', left: '50%' },
      });

      manager.on('dir', getDirection);
      manager.on('end', getJoystickDeactivation);

      joystickManager.current = manager;
    }
  }, [getJoystickDeactivation]);

  useEffect(() => {
    if (joystickManager.current) {
      const joystiq = joystickManager.current.get(0);
      if (!joystiq) {
        return;
      }

      if (gameStatus != GameStatus.GAME_STARTED) {
        joystiq.remove();
      } else {
        if (isPaused) {
          joystiq.remove();
        } else {
          joystiq.add();
        }
      }
    }
  }, [isPaused, gameStatus]);

  return <div ref={thisElement}></div>;
};

export default Joystick;
