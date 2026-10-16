// Serialise read-modify-write per key inside one server instance (counters, indexes) so concurrent requests never lose updates.
const chain = new Map<string, Promise<unknown>>();
export function locked<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const prev = chain.get(key) ?? Promise.resolve(); const next = prev.then(fn, fn); chain.set(key, next.catch(() => {})); return next;
}
