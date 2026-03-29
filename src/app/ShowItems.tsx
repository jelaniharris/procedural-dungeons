import { VisibleObject } from '@/app/VisibleObject';
import { Item } from '@/components/models/Item';
import { useStore } from '@/stores/useStore';
import { tileIndex } from '@/utils/visibilityUtils';
import { JSX } from 'react';
import { shallow } from 'zustand/shallow';

export const ShowItems = () => {
  const { items, visibilityMap, numRows } = useStore(
    (store) => ({
      items: store.items,
      visibilityMap: store.visibilityMap,
      numRows: store.numRows,
    }),
    shallow
  );

  const worldItems: JSX.Element[] = [];
  if (!items) {
    return <></>;
  }

  items.forEach((item) => {
    if (item && item.name) {
      const visibility = visibilityMap[tileIndex(item.position.x, item.position.y, numRows)];
      worldItems.push(
        <VisibleObject key={`${item.name}-${item.id}`} visibility={visibility}>
          <Item item={item} />
        </VisibleObject>
      );
    }
  });
  return <>{worldItems}</>;
};
