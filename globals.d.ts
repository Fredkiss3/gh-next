import * as ReactDOM from "react-dom";

declare global {
  namespace NodeJS {
    interface Global {
      crypto: Crypto;
    }
  }

  type RSCManifest = {
    clientModules?: Record<string, any>;
    moduleLoading?: Record<string, any>;
    ssrModuleMapping?: Record<string, any>;
  };

  var __RSC_MANIFEST: Record<string, RSCManifest> | null;
}
