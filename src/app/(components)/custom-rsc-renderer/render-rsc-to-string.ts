import "server-only";
import * as RSDW from "react-server-dom-webpack/server.edge";
import * as React from "react";
import { getClientManifest } from "./rsc-manifest";

export async function renderRSCtoString(component: React.ReactNode) {
  const rscPayload = RSDW.renderToReadableStream(
    component,
    // the client manifest is required for react to resolve
    // all the clients components and where to import them
    // they will be inlined into the RSC payload as references
    // React will use those references during SSR to resolve
    // the client components
    getClientManifest()
  );
  return await transformStreamToString(rscPayload);
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
