import type { FulfilledThenable, RejectedThenable } from "react";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";

/**
 * Custom `cache` function as `React.cache` doesn't work in the server,
 * this function is intended to be used with `React.use` but you can
 * use it to memoize function calls.
 */
export function fnCache<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const cache = new LRUCache<Awaited<ReturnType<T>>>(200);

  return function cachedFn(
    ...args: Parameters<T>
  ): Promise<Awaited<ReturnType<T>>> {
    return cache.get(args, async () => await fn(...args));
  };
}

/**
 * LRU Cache utility for usage with fnCache
 */
class LRUCache<T> {
  #cache: Map<
    any[],
    { value: Promise<T>; timestamp: number; fetchFn: () => Promise<T> }
  >;
  #maxSize: number;
  #ttl: number;

  constructor(maxSize: number, ttl = DEFAULT_CACHE_TTL) {
    this.#cache = new Map();
    this.#maxSize = maxSize;
    this.#ttl = ttl;
  }

  get(args: any[], fetchFn: () => Promise<T>): Promise<T> {
    const existingKey = Array.from(this.#cache.keys()).find((key) => {
      return (
        args.length === key.length &&
        args.every((arg, index) => arg === key[index])
      );
    });

    const cachedItem = existingKey ? this.#cache.get(existingKey) : null;
    const now = Date.now();

    if (cachedItem && now - cachedItem.timestamp <= this.#ttl * 1000) {
      // Return the cached value if it's not stale
      return cachedItem.value;
    }

    /**
     * We override the promise result and add `status`
     * so that if used with `React.use`,
     * the component doesn't suspend if the function is preloaded.
     */
    const pending = fetchFn()
      .then((value) => {
        // @ts-expect-error
        if (pending.status === "pending") {
          const fulfilledThenable = pending as any;
          fulfilledThenable.status = "fulfilled";
          fulfilledThenable.value = value;
        }
        return value;
      })
      .catch((error) => {
        // @ts-expect-error
        if (pending.status === "pending") {
          const rejectedThenable = pending as any;
          rejectedThenable.status = "rejected";
          rejectedThenable.reason = error;
        }
        throw error;
      });
    // @ts-expect-error
    pending.status = "pending";

    // Fetch or revalidate the data
    const value = pending;
    this.set(args, value, fetchFn);
    return value;
  }

  private set(
    key: any[],
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
