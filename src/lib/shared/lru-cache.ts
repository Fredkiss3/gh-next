import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";

export class LRUCache<T> {
  #cache: Map<
    string,
    { value: Promise<T>; timestamp: number; fetchFn: () => Promise<T> }
  >;
  #maxSize: number;
  #ttl: number;

  constructor(maxSize: number, ttl = DEFAULT_CACHE_TTL) {
    this.#cache = new Map();
    this.#maxSize = maxSize;
    this.#ttl = ttl;
  }

  async get(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cachedItem = this.#cache.get(key);
    const now = Date.now();

    if (cachedItem && now - cachedItem.timestamp <= this.#ttl * 1000) {
      // Return the cached value if it's not stale
      return cachedItem.value;
    }

    // Fetch or revalidate the data
    const value = fetchFn();
    this.set(key, value, fetchFn);
    return value;
  }

  private set(
    key: string,
    valuePromise: Promise<T>,
    fetchFn: () => Promise<T>
  ): void {
    if (this.#cache.size >= this.#maxSize && !this.#cache.has(key)) {
      // Evict the least recently used item
      const firstKey = this.#cache.keys().next().value;
      this.#cache.delete(firstKey);
    }

    this.#cache.set(key, {
      value: valuePromise,
      timestamp: Date.now(),
      fetchFn
    });
  }
}
