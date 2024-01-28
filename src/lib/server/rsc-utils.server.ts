import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { kv } from "~/lib/server/kv/index.server";
import { env } from "~/env";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";

type Callback = (...args: any[]) => Promise<any>;
export function nextCache<T extends Callback>(
  cb: T,
  options: {
    tags: string[];
    revalidate?: number;
  }
) {
  if (process.env.NODE_ENV === "development") {
    return cache(
      ttlCache(cb, {
        id: options.tags,
        ttl: options.revalidate
      })
    );
  }
  return cache(unstable_cache(cb, options.tags, options));
}

export type CacheId = string | number | (string | number)[];
export function ttlCache<T extends Callback>(
  cb: T,
  options: {
    id: CacheId;
    ttl?: number;
    forceDev?: boolean;
  }
) {
  return async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    if (process.env.NODE_ENV === "development" && !options.forceDev) {
      return await cb(...args);
    }

    const { id, ttl = DEFAULT_CACHE_TTL } = options;
    const key =
      env.KV_PREFIX + (Array.isArray(id) ? id.join("-") : id.toString());
    let cachedValue = await kv.get<{
      cached: Awaited<ReturnType<T>>;
    }>(key);

    const cacheHit = !!cachedValue?.cached;

    if (!cachedValue?.cached) {
      cachedValue = {
        cached: await cb(...args)
      };
      await kv.set(key, cachedValue, ttl);
    }

    if (cacheHit) {
      console.log(
        `\x1b[32mCACHE HIT \x1b[37mFOR key \x1b[90m"\x1b[33m${key}\x1b[90m"\x1b[37m`
      );
    } else {
      console.log(
        `\x1b[31mCACHE MISS \x1b[37mFOR key \x1b[90m"\x1b[33m${key}\x1b[90m"\x1b[37m`
      );
    }
    return cachedValue.cached;
  };
}
