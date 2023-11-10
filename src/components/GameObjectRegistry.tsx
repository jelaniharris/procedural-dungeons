import { GameObjectRef } from './entities/GameObject';

export type GameObjectRegistry<T = GameObjectRef> = Map<symbol | string, T>;

export interface GameObjectRegistryUtils {
  registerGameObject: (identifer: symbol, ref: GameObjectRef) => void;
  unregisterGameObject: (identifer: symbol, ref: GameObjectRef) => void;
  getAllRegistryById: () => GameObjectRegistry;
  findGameObjectsByXY: (x: number, y: number) => GameObjectRef[];
}
