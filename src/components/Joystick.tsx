'use client';

/* eslint-disable @typescript-eslint/no-explicit-any */
import { GameState, useStore } from '@/stores/useStore';
import nipplejs from 'nipplejs';
import { useCallback, useEffect, useRef } from 'react';
import { shallow } from 'zustand/shallow';
import {
  PLAYER_ATTEMPT_MOVE,
  PlayerAttemptMoveEvent,
} from './types/EventTypes';
import { Direction, GameStatus, TouchControls } from './types/GameTypes';
import useGame from './useGame';

export type JoyStickData = {
  angle: string;
  distance: number;
};

const Joystick = () => {
  const thisElement = useRef<HTMLDivElement | null>(null);
  const lastData = useRef<JoyStickData>({ distance: 0, angle: '' });
  const joystickManager = useRef<nipplejs.JoystickManager | null>(null);
  const joystiq = useRef<nipplejs.Joystick | null>(null);
  const gameStatus = useStore((store) => store.gameStatus, shallow);
  const isPaused = useStore((store: GameState) => store.isPaused, shallow);
  const getPlayerLocation = useStore((store) => store.getPlayerLocation);
  const settings = useStore((state: GameState) => state.settings);

  const { publish } = useGame();

  const getDirection = (evt: any, data: any) => {
    lastData.current = {
      angle: data.direction.angle,
      distance: data.distance,
    };
  };

  const getJoystickDeactivation = useCallback(() => {
    if (lastData.current.distance > 5) {
      switch (lastData.current.angle) {
        case 'up':
          publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
            currentPosition: getPlayerLocation(),
            desiredDirection: Direction.DIR_NORTH,
          });
          break;
        case 'right':
          publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
            currentPosition: getPlayerLocation(),
            desiredDirection: Direction.DIR_EAST,
          });
          break;
        case 'left':
          publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
            currentPosition: getPlayerLocation(),
            desiredDirection: Direction.DIR_WEST,
          });
          break;
        case 'down':
          publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
            currentPosition: getPlayerLocation(),
            desiredDirection: Direction.DIR_SOUTH,
          });
          break;
      }
    } else {
      publish<PlayerAttemptMoveEvent>(PLAYER_ATTEMPT_MOVE, {
        currentPosition: getPlayerLocation(),
        desiredDirection: Direction.DIR_NONE,
      });
    }

    lastData.current = {
      angle: '',
      distance: 0,
    };
    //setJoyData({ data });
  }, [getPlayerLocation, publish]);

  const createManager = useCallback(() => {
    if (!thisElement.current) {
      return;
    }

    //console.log('Creating joystiq manager');

    if (joystickManager.current) {
      console.log('Joystiq manager is already created');
      return;
    }

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
    joystiq.current = manager.get(0);

    return () => {
      manager.destroy();
      joystickManager.current = null;
    };
  }, [getJoystickDeactivation]);

  useEffect(() => {
    if (settings.touchControlType === TouchControls.CONTROL_THIMBLE) {
      console.log('[Joystiq] Creating manager');
      createManager();
    } else {
      if (joystickManager.current) {
        joystickManager.current.destroy();
        joystickManager.current = null;
      }
    }
  }, [createManager, settings.touchControlType]);

  useEffect(() => {
    if (joystiq.current) {
      //console.log('Has joystiq');
      if (
        gameStatus != GameStatus.GAME_STARTED ||
        settings.touchControlType !== TouchControls.CONTROL_THIMBLE
      ) {
        joystiq.current.remove();
        //console.log('Hiding joystiq because of non playing state');
      } else {
        if (isPaused) {
          joystiq.current.hide();
          //console.log('Hide joystiq');
        } else {
          joystiq.current.show();
          //console.log('Show joystiq');
        }
      }
    } else {
      //console.log('No joystiq');
    }
  }, [isPaused, gameStatus, settings.touchControlType]);

  //console.log('[Joystiq] Render JoysTIQ');

  return <div ref={thisElement}></div>;
};

export default Joystick;
