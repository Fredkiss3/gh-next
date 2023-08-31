import { env } from "~/env.mjs";
import type { KVStore } from ".";

type RedisCommand = "GET" | "SET" | "SETEX" | "DEL";

export class WebdisKV implements KVStore {
  getFullKey(key: string): string {
    return env.KV_PREFIX + key;
  }

  async #fetch<T extends unknown>(
    command: RedisCommand,
    ...args: Array<string | number>
  ) {
    const authString = `${env.REDIS_HTTP_USERNAME}:${env.REDIS_HTTP_PASSWORD}`;
    const dateNow = Date.now();
    let fullURL =
      `${env.REDIS_HTTP_URL}/${command}/` +
      args
        .map((arg) => (typeof arg === "string" ? encodeURIComponent(arg) : arg))
        .join("/");
    console.time(`[${dateNow}] ${command} ${args[0]}`);

    return await fetch(fullURL, {
      method: command === "GET" ? "GET" : "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${btoa(authString)}`,
      },
    }).then(async (r) => {
      console.timeEnd(`[${dateNow}] ${command} ${args[0]}`);
      return r.json() as T;
    });
  }

  async set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number | undefined
  ): Promise<void> {
    const serializedValue = JSON.stringify(value);

    if (ttl_in_seconds) {
      await this.#fetch(
        "SETEX",
        this.getFullKey(key),
        ttl_in_seconds,
        serializedValue
      );
    } else {
      await this.#fetch("SET", this.getFullKey(key), serializedValue);
    }
  }

  async get<T extends Record<string, any> = {}>(
    key: string
  ): Promise<T | null> {
    const value = await this.#fetch<{ GET: string | null }>(
      "GET",
      this.getFullKey(key)
    );
    return value.GET ? (JSON.parse(value.GET) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.#fetch("DEL", this.getFullKey(key));
  }
}
