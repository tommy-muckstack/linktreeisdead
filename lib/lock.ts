// Serialise read-modify-write per key inside one server instance (counters, indexes) so concurrent requests never lose updates.
const chain = new Map<string, Promise<unknown>>();
export function locked<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chain.get(key) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(key, next.catch(() => {})); return next;
}
/** Hold several keys at once. Keys are taken in sorted order, so two callers locking the same pair can't deadlock. */
export function lockedAll<T>(keys: string[], fn: () => Promise<T>): Promise<T> {
  const ks = [...new Set(keys)].sort();
  const run = (i: number): Promise<T> => (i === ks.length ? fn() : locked(ks[i]!, () => run(i + 1)));
  return run(0);
}
