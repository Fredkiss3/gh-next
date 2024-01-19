export async function getClientManifest() {
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
