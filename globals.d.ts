import * as ReactDOM from "react-dom";
import * as React from "react";

declare global {
  namespace NodeJS {
    interface Global {
      crypto: Crypto;
    }
  }

  export type ClientReferenceManifestEntry = {
    id: string;
    // chunks is a double indexed array of chunkId / chunkFilename pairs
    chunks: Array<string>;
    name: string;
  };

  export type ClientManifest = {
    [id: string]: ClientReferenceManifestEntry;
  };

  type RSCManifest = {
    clientModules?: ClientManifest;
    moduleLoading?: Record<string, any>;
    ssrModuleMapping?: Record<string, any>;
  };

  var __RSC_MANIFEST: Record<string, RSCManifest> | null;
}

declare module "react" {
  export function unstable_postpone(reason?: string): never;
}
