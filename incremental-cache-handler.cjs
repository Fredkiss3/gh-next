/// <reference types="node" />
// @ts-check
const { createClient } = require("redis");

/**
 * Represents the possible Redis commands.
 * @typedef {'GET' | 'SET' | 'DEL'} RedisCommand
 */

/**
 * Represents the possible Redis commands.
 * @typedef {import("next/dist/server/lib/incremental-cache").CacheHandler} CacheHandler
 */
/**
 * Represents the possible Redis commands.
 * @typedef {import("next/dist/server/lib/incremental-cache").CacheHandlerValue} IncrementalCacheHandlerValue
 */
/**
 * Represents the possible Redis commands.
 * @typedef {import("next/dist/server/response-cache").IncrementalCacheValue} IncrementalCachedValue
 */

/**
 * @implements {CacheHandler}
 */
module.exports = class incrementalCacheHandler {
  /**
   * @param {string} key
   * @returns
   */
  #buildCacheKey(key) {
    return (process.env.KV_PREFIX ?? "") + key;
  }
  async getRedisClient() {
    if (!this.client || !this.client.isReady) {
      this.client = createClient({ url: process.env.REDIS_URL });
      await this.client.connect();
    }
    return this.client;
  }

  /**
   * Retrieves a cached value.
   * @param {string} key - The key to retrieve.
   * @returns {Promise<IncrementalCacheHandlerValue|null>} - The cached value or null if not found.
   */
  async get(key) {
    const dateNow = Date.now();
    console.time(`[${dateNow} incrementalCache] GET ${key}`);
    const value = await this.getRedisClient().then((client) =>
      client.get(this.#buildCacheKey(key))
    );
    console.timeEnd(`[${dateNow} incrementalCache] GET ${key}`);
    return value === null ? null : JSON.parse(value);
  }

  /**
   * Sets a value in the cache.
   * @param {string} key - The key to set.
   * @param {IncrementalCachedValue|null} data - The data to set.
   * @returns {Promise<void>}
   */
  async set(key, data) {
    const client = await this.getRedisClient();
    const realKey = this.#buildCacheKey(key);

    if (data === null) {
      const keys = await client.keys(realKey);
      if (keys.length > 0) {
        await client.del(realKey);
      }
      return;
    }

    if (data.kind === "IMAGE") {
      // DO NOT CACHE IMAGES AT ALL
      return;
    }

    const dateNow = Date.now();
    console.time(`[${dateNow} incrementalCache] SET ${key}`);
    const ONE_YEAR = 31536000;
    await client.setEx(
      realKey,
      ONE_YEAR,
      JSON.stringify({
        value: data,
        lastModified: Date.now(),
      })
    );
    console.timeEnd(`[${dateNow} incrementalCache] SET ${key}`);
  }

  /**
   * @param {string} tag
   * @returns
   */
  async revalidateTag(tag) {
    const dateNow = Date.now();
    console.time(`[${dateNow} incrementalCache] revalidateTag ${tag}`);
    await this.getRedisClient().then((client) =>
      client.del(this.#buildCacheKey(tag))
    );
    console.timeEnd(`[${dateNow} incrementalCache] revalidateTag ${tag}`);
  }
};
