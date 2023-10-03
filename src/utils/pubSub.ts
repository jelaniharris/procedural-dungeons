// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ConsumerEvent<EventName = string, Data = any | undefined> {
  name: EventName;
  data: Data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler<T = any> = (data: T) => void | Promise<any>;

export default function createPubSub() {
  const events: { [name: string]: Handler[] } = {};

  async function publish<T extends ConsumerEvent>(
    name: T['name'],
    data?: T['data']
  ) {
    const handlers = events[name];
    if (handlers == null) return false;

    await Promise.all(handlers.slice().map((handler) => handler(data)));
    return true;
  }

  function unsubscribe<T extends ConsumerEvent>(
    name: T['name'],
    handler: Handler<T['data']>
  ) {
    const handlers = events[name];
    if (handlers == null) return;

    const index = handlers.indexOf(handler);
    handlers.splice(index, 1);
  }

  function subscribe<T extends ConsumerEvent>(
    name: T['name'],
    handler: Handler<T['data']>
  ) {
    if (events[name] == null) {
      events[name] = [];
    }
    events[name].push(handler);

    return () => unsubscribe(name, handler);
  }

  function hasSubscriptions<T extends ConsumerEvent>(name: T['name']) {
    if (events[name] == null) {
      return 0;
    }
    return events[name].length;
  }

  function unsubscribeAllHandlers<T extends ConsumerEvent>(name: T['name']) {
    if (hasSubscriptions(name)) {
      events[name] = [];
    }
  }

  return {
    publish,
    subscribe,
    unsubscribe,
    unsubscribeAllHandlers,
    hasSubscriptions,
  };
}

export type PubSub = ReturnType<typeof createPubSub>;
