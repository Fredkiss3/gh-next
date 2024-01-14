// @ts-check
import { _envObject as env } from "../../../env-config.mjs";

/**
 * @typedef {import("./index.server").KVStore} KVStore
 */

/**
 * Represents a key-value store using Webdis.
 * For strict usage within `webdis-cache-handler.js`
 *
 * @implements {KVStore}
 */
export class WebdisKV {
  /**
   * Fetches data from the KV store.
   * @param {("GET"|"SET"|"SETEX"|"DEL"|"HSET"|"HGETALL"|"SADD"|"SMEMBERS"|"SREM")} command The Redis command to execute.
   * @param {Array<string|number>} args Arguments for the command.
   * @returns {Promise<any>} The result of the fetch operation.
   */
  async #fetch(command, ...args) {
    /** @type Array<(typeof command)> */
    const commandsWithSingleBody = ["SET", "HSET", "SETEX"];

    const authString = `${env.REDIS_HTTP_USERNAME}:${env.REDIS_HTTP_PASSWORD}`;
    const [key, ...restArgs] = args;

    let body = null;
    const urlParts = [env.KV_PREFIX + key, ...restArgs];
    const partsForTheURL = [];

    for (let i = 0; i < urlParts.length; i++) {
      const part = urlParts[i];

      if (
        i === urlParts.length - 1 &&
        commandsWithSingleBody.includes(command)
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
            ? encodeURIComponent(arg.replaceAll("/", "-"))
            : arg
        )
        .join("/");

    const rand = Math.ceil(Math.random() * 10e15);
    console.time(`[${rand} webdis] ${fullURL}`);
    return await fetch(fullURL, {
      method: "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${btoa(authString)}`
      },
      body: body ?? undefined
    }).then((r) =>
      r.text().then((text) => {
        if (!r.ok) {
          console.log(
            "Couldn't fetch from webdis KV, received this response from server : ",
            {
              text,
              status: r.status,
              statusText: r.statusText
            }
          );
        }
        console.timeEnd(`[${rand} webdis] ${fullURL}`);
        return JSON.parse(text);
      })
    );
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
   * @template T
   * @param {string} key The key under which to store the value.
   * @param {T} value The value to store.
   * @param {number} [ttl_in_seconds] Optional time-to-live in seconds.
   * @returns {Promise<void>}
   */
  async set(key, value, ttl_in_seconds) {
    const serializedValue = JSON.stringify(value);

    if (ttl_in_seconds) {
      await this.#fetch("SETEX", key, ttl_in_seconds, serializedValue);
    } else {
      await this.#fetch("SET", key, serializedValue);
    }
  }

  /**
   * Gets a value from the KV store.
   * @template T
   * @param {string} key
   * @returns {Promise<T | null>}
   */
  async get(key) {
    const value = await this.#fetch("GET", key);
    return value.GET ? JSON.parse(value.GET) : null;
  }

  /**
   * Deletes a key from the KV store.
   * @param {string} key The key to delete.
   * @returns {Promise<void>}
   */
  async delete(key) {
    await this.#fetch("DEL", key);
  }

  /**
   * @param {string} key
   * @param {string|number} value
   * @returns {Promise<void>}
   */
  async sAdd(key, value) {
    await this.#fetch("SADD", key, value);
  }

  /**
   * @param {string} key
   * @returns {Promise<Array<string>>}
   */
  async sMembers(key) {
    const value = await this.#fetch("SMEMBERS", key);
    return value.SMEMBERS;
  }

  /**
   * @param {string} key
   * @param {string|number} value
   * @returns {Promise<void>}
   */
  async sRem(key, value) {
    await this.#fetch("SREM", key, value);
  }
}
