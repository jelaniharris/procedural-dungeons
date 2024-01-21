import { Item, ItemType } from '@/components/types/GameTypes';
import { MathUtils } from 'three/src/math/MathUtils';
import { Point2D } from './Point2D';

export const assignItemDetails = (
  type: ItemType | null,
  position: Point2D,
  newItemIndex: number
) => {
  let newItem: Item = {
    id: newItemIndex,
    type: type === null ? ItemType.ITEM_NONE : type,
    rotates: false,
    position: position,
    modelRotation: { x: 0, y: 0, z: 0 },
    modelPositionOffset: { x: 0, y: 0, z: 0 },
    name: 'coin',
  };

  switch (type) {
    case ItemType.ITEM_COIN:
      newItem = { ...newItem, rotates: true, name: 'coin' };
      break;
    case ItemType.ITEM_CHICKEN:
      newItem = { ...newItem, rotates: true, name: 'chicken_leg' };
      break;
    case ItemType.ITEM_APPLE:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'apple',
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
      };
      break;
    case ItemType.ITEM_CHALICE:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'chalice',
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
      };
      break;
    case ItemType.ITEM_DIAMOND:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'diamond',
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(25) },
      };
      break;

    case ItemType.ITEM_INGOT_STACK:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'gold_ingot_stack',
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(5) },
      };
      break;
    case ItemType.ITEM_WEAPON:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'dagger',
        modelPositionOffset: { x: 0, y: 0.3, z: 0 },
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
      };
      break;
    case ItemType.ITEM_CROWN:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'crown',
        modelPositionOffset: { x: 0, y: 0.3, z: 0 },
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
      };
      break;
    case ItemType.ITEM_POTION:
      newItem = {
        ...newItem,
        rotates: true,
        name: 'potion',
        modelRotation: { x: 0, y: 0, z: MathUtils.degToRad(15) },
      };
      break;
    case null:
    default:
      break;
  }

  return newItem;
};
