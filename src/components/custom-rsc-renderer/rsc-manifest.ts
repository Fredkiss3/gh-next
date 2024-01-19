import { evaluateClientReferences } from "~/components/cache";

export async function getClientManifest() {
  await evaluateClientReferences();
  let clientManifest: ClientManifest = {};

  // we concatennate all the manifest for all pages
  if (globalThis.__RSC_MANIFEST) {
    const allManifests = Object.values(globalThis.__RSC_MANIFEST);
    for (const rscManifest of allManifests) {
      clientManifest = {
        ...clientManifest,
        ...rscManifest.clientModules
      };
    }
  }
  return clientManifest;
}
export function getSSRManifest() {
  let rscManifest: RSCManifest = {};

  // we concatennate all the manifest for all pages
  if (globalThis.__RSC_MANIFEST) {
    const allManifests = Object.values(globalThis.__RSC_MANIFEST);
    for (const manifest of allManifests) {
      rscManifest = {
        ...rscManifest,
        ...manifest
      };
    }
  }

  return {
    ssrManifest: {
      moduleLoading: rscManifest?.moduleLoading,
      moduleMap: rscManifest?.ssrModuleMapping
    }
  };
}
