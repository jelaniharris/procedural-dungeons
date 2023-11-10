export function getSetIntersection<T>(a: Set<T>, b: Set<T>) {
  const ans = new Set<T>();
  a.forEach((v) => b.has(v) && ans.add(v));
  return ans;
}

export function getRandomItemFromSet<T>(set: Set<T>, generator = Math.random) {
  const items = Array.from(set);
  return items[Math.floor(generator() * items.length)];
}

export function popRandomItemFromSet<T>(set: Set<T>, generator = Math.random) {
  const item = getRandomItemFromSet(set, generator);
  set.delete(item);
  return item;
}
