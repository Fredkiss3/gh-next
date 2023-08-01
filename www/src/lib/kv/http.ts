import { z } from "zod";
import type { KVStore } from ".";
import { env } from "~/env.mjs";
import { jsonFetch } from "~/lib/shared-utils";
import { DEFAULT_CACHE_TTL } from "~/lib/constants";

const kvRESTSchema = z.object({
  KV_REST_URL: z.string().url(),
});

export class HttpKV implements KVStore {
  #rest_url: string;

  constructor() {
    const { KV_REST_URL } = kvRESTSchema.parse(env);
    this.#rest_url = KV_REST_URL;
  }
  public async set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number | undefined
  ): Promise<void> {
    await jsonFetch(`${this.#rest_url}/set`, {
      method: "POST",
      body: JSON.stringify({
        key,
        value,
        TTL: ttl_in_seconds ?? DEFAULT_CACHE_TTL,
      }),
    });
  }
  public async get<T extends Record<string, any> = {}>(
    key: string
  ): Promise<T | null> {
    const result = await jsonFetch<
      | {
          data: T;
        }
      | {
          errors: "not found";
        }
    >(`${this.#rest_url}/get/${key}`, {
      method: "GET",
    });

    if ("errors" in result) {
      return null;
    }

    return result.data;
  }
  public async delete(key: string): Promise<void> {
    await jsonFetch(`${this.#rest_url}/delete/${key}`, {
      method: "DELETE",
    });
  }
}
