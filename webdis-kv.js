// @ts-check
const { _envObject: env } = require("./src/env-config.js");
/**
 * Represents a key-value store using Webdis.
 * For strict usage within `webdis-cache-handler.js`
 */
class WebdisKV {
  /**
   * Fetches data from the KV store.
   * @param {("GET"|"SET"|"SETEX"|"DEL"|"HSET"|"HGETALL")} command The Redis command to execute.
   * @param {Array<string|number>} args Arguments for the command.
   * @returns {Promise<any>} The result of the fetch operation.
   */
  async #fetch(command, ...args) {
    const authString = `${env.REDIS_HTTP_USERNAME}:${env.REDIS_HTTP_PASSWORD}`;
    const [key, ...restArgs] = args;

    let body = null;
    const urlParts = [env.KV_PREFIX + key, ...restArgs];
    const partsForTheURL = [];

    for (let i = 0; i < urlParts.length; i++) {
      const part = urlParts[i];

      if (
        i === urlParts.length - 1 &&
        (command === "SET" || command === "HSET" || command === "SETEX")
      ) {
        body = part.toString();
        continue;
      }
      partsForTheURL.push(part.toString());
    }
    const fullURL =
      `${env.REDIS_HTTP_URL}/${command}/` +
      partsForTheURL
        .map((arg) =>
          typeof arg === "string"
            ? // @ts-expect-error
              encodeURIComponent(arg.replaceAll("/", "-"))
            : arg
        )
        .join("/");

    return await fetch(fullURL, {
      method: ["GET", "HGETALL"].includes(command) ? "GET" : "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${btoa(authString)}`
      },
      body: body ?? undefined
    }).then((r) => r.text().then((text) => JSON.parse(text)));
  }

  /**
   * @param {string} key The key under which to store the value.
   * @param {string} field The field
   * @param {string|number} value The value to store.
   * @returns {Promise<void>}
   */
  async hSet(key, field, value) {
    await this.#fetch("HSET", key, field, value);
  }

  /**
   * @param {string} key The key under which to store the value.
   * @returns {Promise<Record<string, string>>}
   */
  async hGetAll(key) {
    const value = await this.#fetch("HGETALL", key);
    return value.HGETALL;
  }

  /**
   * Sets a value in the KV store.
   * @param {string} key The key under which to store the value.
   * @param {string} value The value to store.
   * @param {number} [ttl_in_seconds] Optional time-to-live in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, ttl_in_seconds) {
    if (ttl_in_seconds) {
      await this.#fetch("SETEX", key, ttl_in_seconds, value);
    } else {
      await this.#fetch("SET", key, value);
    }
  }

  /**
   * Gets a value from the KV store.
   * @param {string} key The key of the value to retrieve.
   * @returns {Promise<string|null>} The value found at the key, or null if not found.
   */
  async get(key) {
    const value = await this.#fetch("GET", key);
    return value.GET ?? null;
  }

  /**
   * Deletes a key from the KV store.
   * @param {string} key The key to delete.
   * @returns {Promise<void>}
   */
  async delete(key) {
    await this.#fetch("DEL", key);
  }
}

module.exports = { WebdisKV };
