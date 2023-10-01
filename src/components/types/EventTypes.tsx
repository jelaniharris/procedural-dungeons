import { ConsumerEvent } from '@/utils/pubSub';
import { Enemy } from './GameTypes';

export const PLAYER_MOVED = 'player-moved';
export const PLAYER_TOUCHED_ENEMY = 'player-touched-enemy';
export const PLAYER_DIED = 'player-died';

export type PlayerMovedEvent = ConsumerEvent<
  'player-moved',
  { moved: boolean }
>;

export type PlayerTouchedEnemyEvent = ConsumerEvent<
  'player-touched-enemy',
  { enemy: Enemy }
>;

export type PlayerDiedEvent = ConsumerEvent<'player-died', { enemy: Enemy }>;
