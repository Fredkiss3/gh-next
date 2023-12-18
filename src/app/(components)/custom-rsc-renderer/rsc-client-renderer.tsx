"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "./rsc-manifest";
import { fnCache } from "~/lib/shared/fn-cache";

export type RscClientRendererProps = {
  payloadOrPromise: string | Promise<string>;
  withSSR?: boolean;
};

export function RscClientRenderer({
  payloadOrPromise,
  withSSR = false
}: RscClientRendererProps) {
  return React.use(renderPayloadOrPromiseToJSX(payloadOrPromise, withSSR));
}

export const renderPayloadOrPromiseToJSX = fnCache(
  async function resolveElement(
    payloadOrPromise: string | Promise<string>,
    ssr = false
  ) {
    console.log("Render payload to JSX");
    const payload =
      typeof payloadOrPromise === "string"
        ? payloadOrPromise
        : await payloadOrPromise;
    const rscStream = transformStringToReadableStream(payload);
    let rscPromise: Promise<React.JSX.Element> | null = null;

    // Render to HTML
    if (ssr && typeof window === "undefined") {
      // the SSR manifest contains all the client components that will be SSR'ed
      // And also how to import them
      rscPromise = RSDWSSr.createFromReadableStream(
        rscStream,
        getSSRManifest()
      );
    }

    // Hydrate or CSR
    if (rscPromise === null) {
      rscPromise = RSDW.createFromReadableStream(rscStream, {});
    }

    return await rscPromise;
  }
);

export function transformStringToReadableStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    }
  });
}
