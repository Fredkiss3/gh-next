import { createCacheComponent } from "@rsc-cache/next";
import {
  evaluateClientReferences,
  getBuildId
} from "~/components/custom-rsc-renderer/load-client-references";
import { kv } from "~/lib/server/kv/index.server";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";

const NextRscCacheComponent = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    let cachedPayload = await kv.get<{ rsc: string }>(cacheKey);
    const cacheHit = !!cachedPayload;

    if (!cachedPayload) {
      cachedPayload = { rsc: await generatePayload() };
      await kv.set(cacheKey, cachedPayload, ttl ?? DEFAULT_CACHE_TTL);
    }

    if (cacheHit) {
      console.log(
        `\x1b[32mCACHE HIT \x1b[37mFOR key \x1b[90m"\x1b[33m${cacheKey}\x1b[90m"\x1b[37m`
      );
    } else {
      console.log(
        `\x1b[31mCACHE MISS \x1b[37mFOR key \x1b[90m"\x1b[33m${cacheKey}\x1b[90m"\x1b[37m`
      );
    }
    return cachedPayload.rsc;
  },
  getBuildId
});

export async function Cache(
  props: React.ComponentProps<typeof NextRscCacheComponent>
) {
  await evaluateClientReferences();
  return <NextRscCacheComponent {...props} />;
}
