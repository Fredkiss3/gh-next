"use client";
import * as React from "react";
import * as RSDWSSr from "react-server-dom-webpack/client.edge";
import * as RSDW from "react-server-dom-webpack/client";

import { getSSRManifest } from "./rsc-manifest";

export type RscClientRendererProps = {
  payloadOrPromise: string | Promise<string>;
  withSSR?: boolean;
};

export function RscClientRenderer({
  payloadOrPromise,
  withSSR = false
}: RscClientRendererProps) {
  const renderPromise = React.useMemo(() => {
    /**
     * This is to fix a bug that happens sometimes in the SSR phase,
     * calling `use` seems to suspend indefinitely resulting in
     * your app not responding.
     *
     * We override the promise result and add `status` & `value`,
     * these fields are used internally by `use` and are what's
     * prevent `use` from suspending indefinitely.
     */
    const pendingPromise = resolveElement(payloadOrPromise, withSSR)
      .then((value) => {
        // @ts-expect-error
        if (pendingPromise.status === "pending") {
          const fulfilledThenable = pendingPromise as any;
          fulfilledThenable.status = "fulfilled";
          fulfilledThenable.value = value;
        }
        return value;
      })
      .catch((error) => {
        // @ts-expect-error
        if (pendingPromise.status === "pending") {
          const rejectedThenable = pendingPromise as any;
          rejectedThenable.status = "rejected";
          rejectedThenable.reason = error;
        }
        throw error;
      });
    // @ts-expect-error
    pendingPromise.status = "pending";
    return pendingPromise;
  }, [payloadOrPromise, withSSR]);

  return <RscClientRendererUse promise={renderPromise} />;
}

function RscClientRendererUse(props: {
  promise: Promise<React.JSX.Element>;
}) {
  return React.use(props.promise);
}

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
    rscPromise = RSDWSSr.createFromReadableStream(rscStream, getSSRManifest());
  }

  // Hydrate or CSR
  if (rscPromise === null) {
    rscPromise = RSDW.createFromReadableStream(rscStream, {});
  }

  return await rscPromise;
}

export function transformStringToReadableStream(input: string) {
  // Using Flight to deserialize the args from the string.
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(input));
      controller.close();
    }
  });
}
