"use client";
import * as React from "react";
import * as RSDW from "react-server-dom-webpack/client";
import { unstable_postpone as postpone } from "react";

export type RscClientRendererProps = {
  payloadOrPromise: string | Promise<string>;
};

export function RscClientRenderer({
  payloadOrPromise
}: RscClientRendererProps) {
  if (typeof window === "undefined") {
    postpone("This component can only be used on the client");
  }
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
    const pendingPromise = resolveElement(payloadOrPromise)
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
  }, [payloadOrPromise]);

  return <RscClientRendererUse promise={renderPromise} />;
}

function RscClientRendererUse(props: {
  promise: Promise<React.JSX.Element>;
}) {
  return React.use(props.promise);
}

async function resolveElement(payloadOrPromise: string | Promise<string>) {
  const payload =
    typeof payloadOrPromise === "string"
      ? payloadOrPromise
      : await payloadOrPromise;
  const rscStream = transformStringToReadableStream(payload);
  return await RSDW.createFromReadableStream(rscStream, {});
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
