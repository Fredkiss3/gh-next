import "server-only";
import * as React from "react";
import * as RSDW from "react-server-dom-webpack/server.edge";

// components
import { CacheClient } from "~/app/(components)/cache/cache.client";

// utils
import { getClientManifest } from "~/app/(components)/cache/manifest";
import { kv } from "~/lib/server/kv/index.server";

// types
export type CacheProps<T> = {
  Component: (props: T) => React.ReactNode | Promise<React.ReactNode>;
  props: T;
  id: string;
  ttl: number;
  bypassCache?: boolean;
  debug?: boolean;
};

/**
 * Component for caching RSCs
 * it uses REDIS to cache the payload
 */
export async function Cache<T extends Record<string, any>>({
  Component,
  props,
  id,
  ttl,
  bypassCache = false,
  debug = false
}: CacheProps<T>) {
  if (bypassCache) {
    return <Component {...props} />;
  }

  let cachedPayload = await kv.get<{
    rsc: string;
  }>(id);

  if (!cachedPayload) {
    const stream = RSDW.renderToReadableStream(
      <Component {...props} />,
      getClientManifest()
    );

    cachedPayload = {
      rsc: await streamToString(stream)
    };
    await kv.set(id, cachedPayload, ttl);
  }

  if (debug) {
    return <pre>{cachedPayload.rsc}</pre>;
  }

  return <CacheClient payload={cachedPayload.rsc} />;
}

async function streamToString(stream: ReadableStream) {
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
