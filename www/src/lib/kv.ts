import { env } from "~/env.mjs";
import { DEFAULT_CACHE_TTL } from "./constants";
import { z } from "zod";
import { jsonFetch } from "./shared-utils";

const kvNamespaceSchema = z.object({
  KV: z.object({
    get: z.function(),
    put: z.function(),
    delete: z.function(),
  }),
});

const kvRESTSchema = z.object({
  KV_REST_URL: z.string().url(),
});

export interface KVStore {
  set<T extends any = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number
  ): Promise<void>;
  get<T extends any = {}>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

export class CloudfareKV implements KVStore {
  #client: KVNamespace;

  constructor() {
    kvNamespaceSchema.parse(env);
    this.#client = env.KV as KVNamespace;
  }

  public async set<T extends any = {}>(
    key: string,
    value: T,
    ttl_in_seconds: number = DEFAULT_CACHE_TTL
  ) {
    await this.#client.put(
      key,
      JSON.stringify(value),
      ttl_in_seconds
        ? {
            expirationTtl: ttl_in_seconds,
          }
        : undefined
    );
  }

  public async get<T extends unknown>(key: string) {
    return await this.#client.get(key).then((str) => {
      if (str === null) return null;
      return JSON.parse(str) as T;
    });
  }

  public async delete(key: string) {
    await this.#client.delete(key);
  }
}

export class HttpKV implements KVStore {
  #rest_url: string;

  constructor() {
    const { KV_REST_URL } = kvRESTSchema.parse(env);
    this.#rest_url = KV_REST_URL;
  }
  public async set<T extends unknown = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number | undefined
  ): Promise<void> {
    await jsonFetch(`${this.#rest_url}/set`, {
      method: "POST",
      body: JSON.stringify({
        key,
        value,
        TTL: ttl_in_seconds,
      }),
    });
  }
  public async get<T extends unknown = {}>(key: string): Promise<T | null> {
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

function getKV(): KVStore {
  if (env.KV) {
    return new CloudfareKV();
  } else {
    return new HttpKV();
  }
}

export const kv = getKV();
