import { Point2D } from '@/utils/Point2D';
import { ConsumerEvent } from '@/utils/pubSub';
import { GameObjectRef } from '../entities/GameObject';
import {
  Direction,
  Enemy,
  Hazard,
  OverLayTextType,
  Projectile,
  SpawnWarning,
} from './GameTypes';

export const PLAYER_MOVED = 'player-moved';
export const PLAYER_TOUCHED_ENEMY = 'player-touched-enemy';
export const PLAYER_DIED = 'player-died';
export const PLAYER_DAMAGED_TRAP = 'player-damaged-trap';
export const PLAYER_REACHED_EXIT = 'player-reached-exit';
export const PLAYER_ATTEMPT_MOVE = 'player-attempt-move';

export const ENTITY_DIED = 'entity-died';
export const ENTITY_ALIVE = 'entity-alive';

export const EXIT_GREED = 'exit-greed';
export const EXIT_NEED = 'exit-need';

export const EVENT_STARTGAME = 'start-game';

export const ON_TICK = 'on-tick';

export const CHANGE_SCENE = 'change-scene';

export const TRIGGER_SUMMONING = 'trigger-summoning';

export const DOOR_OPEN = 'door-open';
export const DOOR_CLOSE = 'door-close';

export const OVERLAY_TEXT = 'overlay-text';

export const PROJECTILE_CREATE = 'projectile-create';
export const PROJECTILE_DESTROY = 'projectile-destroy';

export const PLAY_ANIMATION = 'play-animation';

export type EntityDiedEvent = ConsumerEvent<'entity-died'>;
export type EntityAliveEvent = ConsumerEvent<'entity-alive'>;

export type EventStartGameEvent = ConsumerEvent<
  'start-game',
  {
    gameType: string;
  }
>;

export type PlayAnimation = ConsumerEvent<
  'play-animation',
  { animation: string }
>;

export type ChangeSceneEvent = ConsumerEvent<
  'change-scene',
  { nextScene: string }
>;

export type PlayerMovedEvent = ConsumerEvent<
  'player-moved',
  { moved: boolean }
>;

export type PlayerAttemptMoveEvent = ConsumerEvent<
  'player-attempt-move',
  { currentPosition: Point2D; desiredDirection: Direction }
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

export type DoorOpenEvent = ConsumerEvent<'door-open'>;
export type DoorCloseEvent = ConsumerEvent<'door-close'>;

export type TriggerSummoningEvent = ConsumerEvent<
  'trigger-summoning',
  { spawnWarning: SpawnWarning; gameObjectRef: GameObjectRef }
>;

export type OverlayTextEvent = ConsumerEvent<
  'overlay-text',
  {
    type: OverLayTextType;
    text?: string;
    amount?: number;
    mapPosition?: Point2D;
  }
>;

export type ProjectileCreateEvent = ConsumerEvent<
  'projectile-create',
  {
    projectile: Projectile;
  }
>;

export type ProjectileDestroyEvent = ConsumerEvent<
  'projectile-destroy',
  {
    id?: string;
  }
>;

export type PlayAnimationEvent = ConsumerEvent<
  'play-animation',
  {
    animName: string;
  }
>;
