import { _envObject as env } from "~/env-config.mjs";
import type { KVStore } from "./index.server";

type RedisCommand = "GET" | "SET" | "SETEX" | "DEL";

export class WebdisKV implements KVStore {
  async #fetch<T>(command: RedisCommand, ...args: Array<string | number>) {
    const authString = `${env.REDIS_HTTP_USERNAME}:${env.REDIS_HTTP_PASSWORD}`;
    const [key, ...restArgs] = args;

    let body: string | null = null;

    const urlParts = [env.KV_PREFIX + key, ...restArgs];
    const partsForTheURL: string[] = [];
    for (let i = 0; i < urlParts.length; i++) {
      const part = urlParts[i];

      if (
        i === urlParts.length - 1 &&
        (command === "SET" || command === "SETEX")
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

    return await fetch(fullURL, {
      method: command === "GET" ? "GET" : "PUT",
      cache: "no-store",
      headers: {
        Authorization: `Basic ${btoa(authString)}`
      },
      body: body ?? undefined
    }).then(async (r) => {
      const text = await r.text();

      console.log({
        key,
        text,
        fullURL,
        status: { number: r.status, text: r.statusText }
      });
      return JSON.parse(text) as Promise<T>;
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
