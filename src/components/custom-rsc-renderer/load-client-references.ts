import "server-only";
import fs from "fs/promises";
import path from "path";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { lifetimeCache } from "~/lib/shared/lifetime-cache";

export const getBuildId = lifetimeCache(async () => {
  return process.env.NODE_ENV === "development"
    ? new Date().getTime().toString()
    : await fs.readFile(".next/BUILD_ID", "utf-8");
});

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
    const loadClientRefs = async () => {
      await listFilesRecursively().then(
        async (files) => await Promise.allSettled(files.map(evaluateFile))
      );
      return globalThis.__RSC_MANIFEST;
    };

    if (process.env.NODE_ENV === "development") {
      globalThis.__RSC_MANIFEST ??= await loadClientRefs();
    } else {
      const buildId = await getBuildId();
      const tags = [`__rsc_cache__client_manifest_evaluation_${buildId}`];
      const fn = unstable_cache(loadClientRefs, tags, {
        tags
      });
      globalThis.__RSC_MANIFEST ??= await fn();
    }
  }
);
