// @ts-check
import {
  reviveFromBase64Representation,
  replaceJsonWithBase64
} from "@neshca/json-replacer-reviver";
import { IncrementalCache } from "@neshca/cache-handler";
import { WebdisKV } from "./src/lib/server/kv/webdis.server.mjs";

/** @type {{ version: number, items: Record<string, {revalidatedAt: number}>}} */
const localTagsManifest = {
  version: 1,
  items: {}
};

const TAGS_MANIFEST_KEY = "sharedTagsManifest";
const CACHE_HANDLER_KEY = "incrementalCache";

/**
 * @typedef {typeof CACHE_HANDLER_KEY} CACHE_HANDLER_KEY
 */

const client = new WebdisKV();
IncrementalCache.onCreation(() => {
  return {
    useFileSystem: false, // don't read or write from the file system
    cache: {
      async get(key) {
        try {
          const result = /** @type {{ [CACHE_HANDLER_KEY]: string }} */ (
            await client.get(key)
          );

          if (!result) {
            return null;
          }

          // use reviveFromBase64Representation to restore binary data from Base64
          return JSON.parse(
            result[CACHE_HANDLER_KEY],
            reviveFromBase64Representation
          );
        } catch (error) {
          return null;
        }
      },
      async set(key, value) {
        try {
          // use replaceJsonWithBase64 to store binary data in Base64 and save space
          await client.set(key, {
            [CACHE_HANDLER_KEY]: JSON.stringify(value, replaceJsonWithBase64)
          });
        } catch (error) {
          // ignore because value will be written to disk
        }
      },
      async getTagsManifest() {
        try {
          const remoteTagsManifest = await client.hGetAll(TAGS_MANIFEST_KEY);

          if (!remoteTagsManifest) {
            return localTagsManifest;
          }

          Object.entries(remoteTagsManifest).reduce(
            (acc, [tag, revalidatedAt]) => {
              acc[tag] = {
                revalidatedAt: parseInt(revalidatedAt ?? "0", 10)
              };
              return acc;
            },
            localTagsManifest.items
          );

          return localTagsManifest;
        } catch (error) {
          return localTagsManifest;
        }
      },
      async revalidateTag(tag, revalidatedAt) {
        try {
          await client.hSet(TAGS_MANIFEST_KEY, tag, revalidatedAt);
        } catch (error) {
          localTagsManifest.items[tag] = { revalidatedAt };
        }
      }
    }
  };
});
export default IncrementalCache;
