import { ConsumerEvent } from '@/utils/pubSub';
import { Enemy, Hazard } from './GameTypes';

export const PLAYER_MOVED = 'player-moved';
export const PLAYER_TOUCHED_ENEMY = 'player-touched-enemy';
export const PLAYER_DIED = 'player-died';
export const PLAYER_DAMAGED_TRAP = 'player-damaged-trap';
export const PLAYER_REACHED_EXIT = 'player-reached-exit';

export const EXIT_GREED = 'exit-greed';
export const EXIT_NEED = 'exit-need';

export const ON_TICK = 'on-tick';

export type PlayerMovedEvent = ConsumerEvent<
  'player-moved',
  { moved: boolean }
>;

export type PlayerTouchedEnemyEvent = ConsumerEvent<
  'player-touched-enemy',
  { enemy: Enemy }
>;

export type PlayerDamagedTrapEvent = ConsumerEvent<
  'player-damaged-trap',
  { hazard: Hazard }
>;

export type PlayerDiedEvent = ConsumerEvent<'player-died', { enemy: Enemy }>;

export type OnTickEvent = ConsumerEvent<'on-tick'>;
