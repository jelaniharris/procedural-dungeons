import { OnTickEvent } from '../types/EventTypes';
import useGameObjectEvent from './useGameObjectEvent';

export const OnTick = () => {
  useGameObjectEvent<OnTickEvent>('on-tick', () => {
    console.log('I ticked!');
  });

  return null;
};
