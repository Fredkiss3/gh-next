import { createCacheComponent } from "@rsc-cache/next";
import fs from "fs/promises";
import { kv } from "~/lib/server/kv/index.server";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";
import { lifetimeCache } from "~/lib/shared/lifetime-cache";

import path from "path";
import { unstable_cache } from "next/cache";
import { cache } from "react";

// Async function to recursively list files
async function listFilesRecursively(dir = ".next"): Promise<string[]> {
  let fileList: string[] = [];
  const files = await fs.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileStats = await fs.stat(filePath);

    if (fileStats.isDirectory()) {
      fileList = fileList.concat(await listFilesRecursively(filePath));
    } else if (file.endsWith("client-reference-manifest.js")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function evaluateFile(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    eval(fileContent);
  } catch (err) {
    console.error(`Error evaluating client reference ${filePath}:`, err);
  }
}

export const evaluateClientReferences = cache(
  async function evaluateClientReferences() {
    const loadClientRefs = async () =>
      await listFilesRecursively().then(
        async (files) => await Promise.allSettled(files.map(evaluateFile))
      );
    if (process.env.NODE_ENV === "development") {
      await loadClientRefs();
    } else {
      const buildId = await getBuildId();
      const tags = [`__rsc_cache__client_manifest_evaluation_${buildId}`];
      const fn = unstable_cache(loadClientRefs, tags, {
        tags
      });
      await fn();
    }
  }
);

const getBuildId = lifetimeCache(async () => {
  return process.env.NODE_ENV === "development"
    ? new Date().getTime().toString()
    : await fs.readFile(".next/BUILD_ID", "utf-8");
});

const NextRscCacheComponent = createCacheComponent({
  async cacheFn(generatePayload, cacheKey, ttl) {
    let cachedPayload = await kv.get<{ rsc: string }>(cacheKey);
    const cacheHit = !!cachedPayload;

    if (!cachedPayload) {
      cachedPayload = { rsc: await generatePayload() };
      await kv.set(cacheKey, cachedPayload, ttl ?? DEFAULT_CACHE_TTL);
    }

    if (cacheHit) {
      console.log(
        `\x1b[32mCACHE HIT \x1b[37mFOR key \x1b[90m"\x1b[33m${cacheKey}\x1b[90m"\x1b[37m`
      );
    } else {
      console.log(
        `\x1b[31mCACHE MISS \x1b[37mFOR key \x1b[90m"\x1b[33m${cacheKey}\x1b[90m"\x1b[37m`
      );
    }
    return cachedPayload.rsc;
  },
  getBuildId
});

export async function Cache(
  props: React.ComponentProps<typeof NextRscCacheComponent>
) {
  await evaluateClientReferences();
  return <NextRscCacheComponent {...props} />;
}
