import "server-only";
import * as React from "react";
import * as RSDW from "react-server-dom-webpack/server.edge";

// components
import { CacheClient } from "~/app/(components)/cache/cache.client";

// utils
import { getClientManifest } from "~/app/(components)/cache/manifest";
import { kv } from "~/lib/server/kv/index.server";

// types
export type CacheProps = {
  id: string;
  ttl?: number;
  bypass?: boolean;
  debug?: boolean;
  children?: React.ReactNode;
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
  bypass = false,
  debug = false,
  children
}: CacheProps) {
  if (bypass) {
    return <>{children}</>;
  }

  // don't include DEV dependencies into the production server bundle
  const fullKey = `${process.env.NODE_ENV}-${id}`;
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
    await kv.set(fullKey, cachedPayload, ttl);
    console.log({
      cached: { [id]: false }
    });
  } else {
    console.log({
      cached: { [id]: true }
    });
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
