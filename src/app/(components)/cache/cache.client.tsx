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
  let rscPromise: Promise<React.ReactNode> | null = null;
  const rscStrem = stringToStream(payload);

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
