import "server-only";
import * as React from "react";

// components
import { RscClientRenderer } from "~/app/(components)/custom-rsc-renderer/rsc-client-renderer";
import { renderRSCtoString } from "~/app/(components)/custom-rsc-renderer/render-rsc-to-string";

// utils
import { cache } from "react";
import { kv } from "~/lib/server/kv/index.server";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";
import fs from "fs/promises";
import { CacheErrorBoundary } from "~/app/(components)/cache/cache-error-boundary";

// types
type CacheId = string | number | (string | number)[];
export type CacheProps = {
  id: CacheId;
  ttl?: number;
  bypassInDEV?: boolean;
  debug?: boolean;
  children: React.ReactNode;
  updatedAt?: Date | number;
};

/**
 * Component for caching RSCs
 * it uses REDIS to cache the payload.
 *
 * **⚠️⚠️ WARNING ⚠️⚠️** : this uses React experimental APIs, use this at your own risk
 */
export async function Cache({
  id,
  ttl,
  bypassInDEV,
  children,
  updatedAt,
  debug = false
}: CacheProps) {
  const fullKey = await computeCacheKey(id, updatedAt);

  if (
    bypassInDEV ||
    (bypassInDEV === undefined && process.env.NODE_ENV === "development")
  ) {
    console.log(
      `\x1b[33mBYPASSING CACHE\x1b[37m FOR key "\x1b[34m${fullKey}\x1b[90m"\x1b[37m`
    );
    return <>{children}</>;
  }

  let cachedPayload = await kv.get<{
    rsc: string;
  }>(fullKey);

  const cacheHit = !!cachedPayload;

  if (!cachedPayload) {
    cachedPayload = {
      rsc: await renderRSCtoString(children)
    };
    await kv.set(fullKey, cachedPayload, ttl ?? DEFAULT_CACHE_TTL);
  }

  if (cacheHit) {
    console.log(
      `\x1b[32mCACHE HIT \x1b[37mFOR key \x1b[90m"\x1b[34m${fullKey}\x1b[90m"\x1b[37m`
    );
  } else {
    console.log(
      `\x1b[33mCACHE MISS \x1b[37mFOR key \x1b[90m"\x1b[34m${fullKey}\x1b[90m"\x1b[37m`
    );
  }

  if (debug) {
    return <pre>{cachedPayload.rsc}</pre>;
  }

  return (
    <CacheErrorBoundary>
      <RscClientRenderer
        withSSR
        payloadOrPromise={cachedPayload.rsc}
        rscCacheKey={fullKey}
      />
    </CacheErrorBoundary>
  );
}

export const getBuildId = cache(async () => {
  try {
    return await fs.readFile(".next/BUILD_ID", "utf-8");
  } catch (e) {
    return "";
  }
});

async function computeCacheKey(id: CacheId, updatedAt?: Date | number) {
  let fullKey = Array.isArray(id) ? id.join("-") : id.toString();
  if (updatedAt) {
    fullKey += `-${new Date(updatedAt).getTime()}`;
  }

  // the build ID is necessary because the client references for one build
  // won't necessarily be the same for another build, especially if the component
  // changed in the meantime
  const buildId = await getBuildId();
  if (buildId) {
    fullKey += `-${buildId}`;
  }
  return fullKey;
}
