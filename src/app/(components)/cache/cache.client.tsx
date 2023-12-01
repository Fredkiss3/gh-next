"use client";
import * as React from "react";
// @ts-ignore
// import { unstable_postpone as postpone } from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

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
    let rscManifest: RSCManifest = {};

    // we concatennate all the manifest for all pages
    if (globalThis.__RSC_MANIFEST) {
      const allManifests = Object.values(globalThis.__RSC_MANIFEST);
      for (const manifest of allManifests) {
        rscManifest = {
          ...rscManifest,
          ...manifest
        };
      }
    }

    cache.current = RSDWSSr.createFromReadableStream(stream, {
      ssrManifest: {
        moduleLoading: rscManifest?.moduleLoading,
        moduleMap: rscManifest?.ssrModuleMapping
      }
    });
  }

  // CSR Case
  if (!cache.current) {
    cache.current = RSDW.createFromReadableStream(stream, {});
  }
  const el = React.use(cache.current!);
  return <>{el}</>;
}
