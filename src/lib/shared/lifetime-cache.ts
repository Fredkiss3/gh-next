/**
 * Custom `cache` but for caching items for the scope for the lifetime of the server,
 * on the client it will cache the result until the tab is refreshed.
 */
export function lifetimeCache<T extends (...args: any[]) => Promise<any>>(
  fn: T
) {
  const cache = new PromiseCache<Awaited<ReturnType<T>>>(500);

  return function cachedFn(
    ...args: Parameters<T>
  ): Thenable<Awaited<ReturnType<T>>> {
    return cache.get(args, async () => await fn(...args));
  };
}

/**
 * LRU Cache utility for usage with fnCache
 */
class PromiseCache<T> {
  #cache: Map<
    any[],
    {
      value: Thenable<T>;
      fetchFn: () => Promise<T>;
    }
  >;
  #maxSize: number;

  constructor(maxSize: number) {
    this.#cache = new Map();
    this.#maxSize = maxSize;
  }

  get(args: any[], fetchFn: () => Promise<T>): Thenable<T> {
    const existingKey = Array.from(this.#cache.keys()).find((key) => {
      return (
        args.length === key.length &&
        args.every((arg, index) => arg === key[index])
      );
    });

    const cachedItem = existingKey ? this.#cache.get(existingKey) : null;

    if (cachedItem) {
      return cachedItem.value;
    }

    /**
     * We override the promise result and add `status`
     * so that if used with `React.use`,
     * the component doesn't suspend if the function is preloaded.
     */
    const thenableValue = fetchFn() as Thenable<T>;

    thenableValue
      .then((value) => {
        if (thenableValue.status === "pending") {
          const fulfilledThenable =
            thenableValue as unknown as FulfilledThenable<T>;
          fulfilledThenable.status = "fulfilled";
          fulfilledThenable.value = value;
        }
        return value;
      })
      .catch((error) => {
        if (thenableValue.status === "pending") {
          const rejectedThenable =
            thenableValue as unknown as RejectedThenable<T>;
          rejectedThenable.status = "rejected";
          rejectedThenable.reason = error;
        }
        throw error;
      });
    thenableValue.status = "pending";

    // Fetch or revalidate the data
    this.set(args, thenableValue, fetchFn);
    return thenableValue;
  }

  private set(
    key: any[],
    valuePromise: Thenable<T>,
    fetchFn: () => Promise<T>
  ): void {
    if (this.#cache.size >= this.#maxSize && !this.#cache.has(key)) {
      // Evict the least recently used item
      const firstKey = this.#cache.keys().next().value;
      this.#cache.delete(firstKey);
    }

    this.#cache.set(key, {
      value: valuePromise,
      fetchFn
    });
  }
}

/**
 * From the React `use` internals
 */
interface FulfilledThenable<T> extends Promise<T> {
  status: "fulfilled";
  value: T;
}

interface PendingThenable<T> extends Promise<T> {
  status: "pending";
}

interface RejectedThenable<T> extends Promise<T> {
  status: "rejected";
  reason: any;
}

export type Thenable<T> =
  | FulfilledThenable<T>
  | PendingThenable<T>
  | RejectedThenable<T>;
