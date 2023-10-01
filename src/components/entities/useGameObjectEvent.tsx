import { ConsumerEvent } from '@/utils/pubSub';
import { DependencyList, useEffect, useRef } from 'react';

export default function useGameObjectEvent<T extends ConsumerEvent>(
  eventName: T['name'],
  callback: (data: T['data']) => void,
  deps: DependencyList = []
) {
  const callbackRef = useRef<typeof callback>();
  //const { subscribe } = useGameObject();

  callbackRef.current = callback;

  useEffect(() => {
    //return subscribe(eventName, callbackRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/*subscribe,*/ eventName, ...deps]);
}
