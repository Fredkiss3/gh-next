import "server-only";
import * as React from "react";
import * as RSDW from "react-server-dom-webpack/server.edge";

// components
import { CacheClient } from "~/app/(components)/cache/cache.client";

// utils
import { getClientManifest } from "~/app/(components)/cache/manifest";
import { cache } from "react";
import { kv } from "~/lib/server/kv/index.server";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";
import fs from "fs/promises";

// types
type CacheId = string | number | (string | number)[];
export type CacheProps = {
  id: CacheId;
  ttl?: number;
  bypass?: boolean;
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
  bypass,
  debug = false,
  children,
  updatedAt
}: CacheProps) {
  const fullKey = await computeCacheKey(id, updatedAt);

  if (
    bypass ||
    (bypass === undefined && process.env.NODE_ENV === "development")
  ) {
    console.log(
      `\x1b[90mBYPASSING CACHE FOR key "\x1b[33m${fullKey}\x1b[90m"\x1b[37m`
    );
    return <>{children}</>;
  }

  let cachedPayload = await kv.get<{
    rsc: string;
  }>(fullKey);

  if (!cachedPayload) {
    const rscStream = RSDW.renderToReadableStream(
      children,
      // the client manifest is required for react to resolve
      // all the clients components and where to import them
      // they will be inlined into the RSC payload as references
      // React will use those references during SSR to resolve
      // the client components
      getClientManifest()
    );

    cachedPayload = {
      rsc: await transformStreamToString(rscStream)
    };
    await kv.set(fullKey, cachedPayload, ttl ?? DEFAULT_CACHE_TTL);
  }

  if (debug) {
    return <pre>{cachedPayload.rsc}</pre>;
  }

  return <CacheClient payload={cachedPayload.rsc} />;
}

async function transformStreamToString(stream: ReadableStream) {
  const reader = stream.getReader();
  const textDecoder = new TextDecoder();
  let result = "";

  async function read() {
    const { done, value } = await reader.read();

    if (done) {
      return result;
    }

    result += textDecoder.decode(value, { stream: true });
    return read();
  }

  return read();
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
  // we also get encode the
  const buildId = await getBuildId();
  if (updatedAt) {
    fullKey += `-${new Date(updatedAt).getTime()}`;
  }
  if (buildId) {
    fullKey += `-${buildId}`;
  }
  return fullKey;
}
