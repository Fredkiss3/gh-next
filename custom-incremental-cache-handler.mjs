// @ts-check
import {
  reviveFromBase64Representation,
  replaceJsonWithBase64
} from "@neshca/json-replacer-reviver";
import { IncrementalCache } from "@neshca/cache-handler";
import { WebdisKV } from "./src/lib/server/kv/webdis.server.mjs";

const REVALIDATED_TAGS_KEY = "sharedRevalidatedTags";
const CACHE_HANDLER_KEY = "incrementalCache";

/**
 * @typedef {typeof CACHE_HANDLER_KEY} CACHE_HANDLER_KEY
 */

const client = new WebdisKV();

IncrementalCache.onCreation(() => {
  /** @type {import("@neshca/cache-handler").Cache} */
  const webdisKvHandler = {
    name: "WebdisKV",
    async get(key) {
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
    },
    async set(key, value) {
      // use replaceJsonWithBase64 to store binary data in Base64 and save space
      await client.set(key, {
        [CACHE_HANDLER_KEY]: JSON.stringify(value, replaceJsonWithBase64)
      });
    },
    async getRevalidatedTags() {
      const sharedRevalidatedTags = await client.hGetAll(REVALIDATED_TAGS_KEY);

      const entries = Object.entries(sharedRevalidatedTags);

      /** @type {import("@neshca/cache-handler").RevalidatedTags} */
      const revalidatedTags = {};

      entries.reduce((acc, [tag, revalidatedAt]) => {
        acc[tag] = Number(revalidatedAt);
        return acc;
      }, revalidatedTags);

      return revalidatedTags;
    },
    async revalidateTag(tag, revalidatedAt) {
      await client.hSet(REVALIDATED_TAGS_KEY, tag, revalidatedAt);
    }
  };

  return {
    cache: [webdisKvHandler],
    useFileSystem: false
  };
});

export default IncrementalCache;
