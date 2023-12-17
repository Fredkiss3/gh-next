import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { kv } from "~/lib/server/kv/index.server";

type Callback = (...args: any[]) => Promise<any>;
export function nextCache<T extends Callback>(
  cb: T,
  options: {
    tags: string[];
    revalidate?: number;
  }
) {
  if (process.env.NODE_ENV === "development") {
    return cache(cacheForDev(cb, options));
  }
  return cache(unstable_cache(cb, options.tags, options));
}

/**
 * This function is only used in `DEV` because fetch-cache is bypassed by nextjs on DEV
 */
function cacheForDev<T extends Callback>(
  cb: T,
  options: {
    tags: string[];
    revalidate?: number;
  }
) {
  return async (...args: Parameters<T>) => {
    const key = options.tags.join("-");
    let cachedValue = await kv.get<{
      cached: ReturnType<T>;
    }>(key);

    if (!cachedValue?.cached) {
      cachedValue = {
        cached: await cb(...args)
      };
      await kv.set(key, cachedValue, options.revalidate);
    }
    return cachedValue.cached;
  };
}
