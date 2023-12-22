// @ts-check
const {
  reviveFromBase64Representation,
  replaceJsonWithBase64
} = require("@neshca/json-replacer-reviver");
const { IncrementalCache } = require("@neshca/cache-handler");
const { WebdisKV } = require("./webdis-kv");

const localTagsManifest = {
  version: 1,
  items: {}
};

const TAGS_MANIFEST_KEY = "sharedTagsManifest";

const client = new WebdisKV();
IncrementalCache.onCreation(() => {
  return {
    useFileSystem: false, // don't read or write from the file system
    cache: {
      async get(key) {
        try {
          const result = await client.get(key);

          if (!result) {
            return null;
          }

          // use reviveFromBase64Representation to restore binary data from Base64
          return JSON.parse(result, reviveFromBase64Representation);
        } catch (error) {
          return null;
        }
      },
      async set(key, value) {
        try {
          // use replaceJsonWithBase64 to store binary data in Base64 and save space
          await client.set(key, JSON.stringify(value, replaceJsonWithBase64));
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
module.exports = IncrementalCache;
