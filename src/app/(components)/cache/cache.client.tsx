"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "~/app/(components)/cache/manifest";

function stringToStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    }
  });
}

export function CacheClient({ payload }: { payload: string }) {
  const cache: { current: Promise<React.ReactNode> | null } = { current: null };
  const stream = stringToStream(payload);

  // SSR case
  if (typeof window === "undefined") {
    cache.current = RSDWSSr.createFromReadableStream(stream, getSSRManifest());
  }

  // CSR Case
  if (!cache.current) {
    cache.current = RSDW.createFromReadableStream(stream, {});
  }
  const el = React.use(cache.current!);
  return <>{el}</>;
}
