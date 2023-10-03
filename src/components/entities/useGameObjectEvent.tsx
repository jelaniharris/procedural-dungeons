import { ConsumerEvent } from '@/utils/pubSub';
import { DependencyList, useEffect, useRef } from 'react';
import useGameObject from './useGameObject';

export default function useGameObjectEvent<T extends ConsumerEvent>(
  eventName: T['name'],
  callback: (data: T['data']) => void,
  deps: DependencyList = []
) {
  const callbackRef = useRef<typeof callback>();
  const { subscribe } = useGameObject();

  callbackRef.current = callback;

  useEffect(() => {
    if (callbackRef && callbackRef.current) {
      return subscribe(eventName, callbackRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscribe, eventName, ...deps]);
}
