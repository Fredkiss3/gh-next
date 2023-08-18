import { env } from "~/env.mjs";
import type { KVStore } from ".";

type RedisCommand = "GET" | "SET" | "SETEX" | "DEL";

export class WebdisKV implements KVStore {
  async #fetch<T extends unknown>(
    command: RedisCommand,
    ...args: Array<string | number>
  ) {
    const authString = `${env.REDIS_HTTP_USERNAME}:${env.REDIS_HTTP_PASSWORD}`;
    let fullURL =
      `${env.REDIS_HTTP_URL}/${command}/` +
      args
        .map((arg) => (typeof arg === "string" ? encodeURIComponent(arg) : arg))
        .join("/");

    console.log({
      fullURL,
      headers: {
        Authorization: `Basic ${btoa(authString)}`,
      },
    });
    return await fetch(fullURL, {
      method: command === "GET" ? "GET" : "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${btoa(authString)}`,
      },
    }).then(async (r) => {
      const bodyText = await r.text();
      console.log({
        text: bodyText,
        headers: Object.fromEntries(r.headers),
      });
      return JSON.parse(bodyText) as T;
    });
  }

  async set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number | undefined
  ): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (ttl_in_seconds) {
      await this.#fetch("SETEX", key, ttl_in_seconds, serializedValue);
    } else {
      await this.#fetch("SET", key, serializedValue);
    }
  }

  async get<T extends Record<string, any> = {}>(
    key: string
  ): Promise<T | null> {
    const value = await this.#fetch<{ GET: string | null }>("GET", key);
    return value.GET ? (JSON.parse(value.GET) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.#fetch("DEL", key);
  }
}
