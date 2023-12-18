"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "~/app/(components)/cache/manifest";
import { ErrorBoundary } from "react-error-boundary";
import { useRSCCacheContext } from "~/app/(components)/cache/cache-context";
import { wait } from "~/lib/shared/utils.shared";

function transformStringToStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    },
    cancel(reason) {
      console.error(
        `\x1b[31mrendering cancelled for the flight stream : \x1b[33m${reason}\x1b[37m`
      );
    }
  });
}

export function CacheClient({
  payload,
  cacheKey
}: {
  payload: string;
  cacheKey: string;
}) {
  if (typeof window === "undefined") {
    console.log("[SSR] before `use`");
  } else {
    console.log("[CSR] before `use`");
  }

  let rscPromise: Promise<React.JSX.Element> | null = null;
  const rscCache = useRSCCacheContext();
  if (rscCache.has(cacheKey)) {
    rscPromise = rscCache.get(cacheKey)!;
  } else {
    const rscStream = transformStringToStream(payload);
    // Render to HTML
    if (typeof window === "undefined") {
      // the SSR manifest contains all the client components that will be SSR'ed
      // And also how to import them
      rscPromise = Promise.race([
        RSDWSSr.createFromReadableStream(rscStream, getSSRManifest()),
        wait(2000).then(() => {
          throw new Error("[SSR] RSC CLIENT RENDERER timeout");
        })
      ]);
    } else {
      // Hydrate or CSR
      rscPromise = Promise.race([
        RSDW.createFromReadableStream(rscStream, {}),
        wait(2000).then(() => {
          throw new Error("[CSR] RSC CLIENT RENDERER timeout");
        })
      ]);
    }
    rscCache.set(cacheKey, rscPromise);
  }

  const element = React.use(rscPromise);
  if (typeof window === "undefined") {
    console.log("[SSR] after `use`");
  } else {
    console.log("[CSR] after `use`");
  }
  return element;
}

export function CacheErrorBoundary({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => {
        if (typeof window === "undefined") {
          console.error(`Error SSR'ing the cached component :`, error);
        } else {
          console.error(`Error client rendering the cached component :`, error);
        }
        return (
          <div className="flex flex-wrap gap-2">
            <span className="text-xl font-semibold">
              Error rendering the cached component :
            </span>
            <code className="rounded-md bg-neutral text-red-400 px-1.5 py-1">
              {error.toString()}
            </code>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
