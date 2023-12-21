import { z } from "zod";
import { env } from "~/env";
import { DEFAULT_CACHE_TTL } from "~/lib/shared/constants";

import type { KVStore } from "./index.server";

const CloudfarekvNamespaceSchema = z.object({
  KV: z.object({
    get: z.function(),
    put: z.function(),
    delete: z.function()
  })
});

export class CloudfareKV implements KVStore {
  #client: KVNamespace;

  constructor() {
    CloudfarekvNamespaceSchema.parse(env);
    // @ts-expect-error
    this.#client = env.KV as KVNamespace;
  }

  public async set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds: number = DEFAULT_CACHE_TTL
  ) {
    await this.#client.put(
      key,
      JSON.stringify(value),
      ttl_in_seconds
        ? {
            expirationTtl: ttl_in_seconds
          }
        : undefined
    );
  }

  public async get<T extends Record<string, any>>(key: string) {
    return await this.#client.get(key).then((str) => {
      if (str === null) return null;
      return JSON.parse(str) as T;
    });
  }

  public async delete(key: string) {
    await this.#client.delete(key);
  }
}
