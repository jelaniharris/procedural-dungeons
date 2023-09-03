import { Item } from '@/components/models/Item';
import { useStore } from '@/stores/useStore';
import { JSX } from 'react';
import { shallow } from 'zustand/shallow';

export const ShowItems = () => {
  const { items } = useStore(
    (store) => ({
      items: store.items,
    }),
    shallow
  );

  console.log('Showing items');

  const worldItems: JSX.Element[] = [];
  if (!items) {
    return <></>;
  }
  //console.log('Rendering items');

  items.forEach((item) => {
    //console.log(item);
    if (item && item.name) {
      //console.log('adding item ', item);
      //ref={(node) => (itemsRefs.current[item.id] = node)}

      worldItems.push(<Item key={`${item.name}-${item.id}`} item={item} />);
    }
  });
  return <>{worldItems}</>;
};
