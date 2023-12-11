declare module "react-server-dom-webpack/server.edge" {
  export type ReactClientValue = any;
  export type ClientReferenceManifestEntry = {
    id: string;
    // chunks is a double indexed array of chunkId / chunkFilename pairs
    chunks: Array<string>;
    name: string;
  };

  export type ClientManifest = {
    [id: string]: ClientReferenceManifestEntry;
  };

  export type Options = {
    identifierPrefix?: string;
    signal?: AbortSignal;
    onError?: (error: unknown) => void;
    onPostpone?: (reason: string) => void;
  };

  export function renderToReadableStream(
    model: ReactClientValue,
    webpackMap: ClientManifest,
    options?: Options
  ): ReadableStream;
}

declare module "react-server-dom-webpack/client.edge" {
  export function createFromReadableStream(
    stream: ReadableStream,
    options: {
      ssrManifest: {
        moduleLoading: any;
        moduleMap: any;
      };
    }
  ): Promise<React.JSX.Element>;
}

declare module "react-server-dom-webpack/client" {
  export function createFromReadableStream(
    stream: ReadableStream,
    options?: Record<string, any>
  ): Promise<React.JSX.Element>;
}
