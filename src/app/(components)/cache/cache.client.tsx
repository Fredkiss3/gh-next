"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "~/app/(components)/cache/manifest";
import { ErrorBoundary } from "react-error-boundary";

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

export function CacheClient({ payload }: { payload: string }) {
  let rscPromise: Promise<React.ReactNode> | null = null;
  const rscStrem = transformStringToStream(payload);

  // Render to HTML
  if (typeof window === "undefined") {
    rscPromise = RSDWSSr.createFromReadableStream(rscStrem, getSSRManifest());
  }

  // Hydrate or CSR
  if (!rscPromise) {
    rscPromise = RSDW.createFromReadableStream(rscStrem, {});
  }

  const el = React.use(rscPromise);
  return <>{el}</>;
}

export function CacheErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => {
        if (typeof window === "undefined") {
          console.error(
            `Error SSR'ing the cached component, failing back to rendering the component as is.`,
            error
          );
        } else {
          console.error(
            `Error client rendering the cached component, failing back to rendering the component as is.`,
            error
          );
        }
        return fallback;
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
