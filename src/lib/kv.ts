import { Redis } from "@upstash/redis/cloudflare";
import { env, kvSchema } from "~/env.mjs";
import type { ZodType } from "zod";

export class KV {
  #client: KVNamespace | Redis;

  constructor() {
    const result = kvSchema.parse(env);

    if (result.KV) {
      this.#client = result.KV as KVNamespace;
    } else {
      this.#client = Redis.fromEnv(result);
    }
  }

  public async set<T extends any = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number
  ) {
    const fullKey = `${env.KV_PREFIX}${key}`;

    if (this.#client instanceof Redis) {
      return this.#client.set(
        fullKey,
        value,
        ttl_in_seconds
          ? {
              ex: ttl_in_seconds,
            }
          : undefined
      );
    } else {
      return this.#client.put(
        fullKey,
        JSON.stringify(value),
        ttl_in_seconds
          ? {
              expirationTtl: ttl_in_seconds,
            }
          : undefined
      );
    }
  }

  public async get<T extends unknown>(key: string) {
    const fullKey = `${env.KV_PREFIX}${key}`;

    if (this.#client instanceof Redis) {
      return this.#client.get<T>(fullKey);
    } else {
      return this.#client.get(fullKey).then((str) => {
        if (str === null) return null;
        return JSON.parse(str) as T;
      });
    }
  }

  public async delete(key: string) {
    const fullKey = `${env.KV_PREFIX}${key}`;
    if (this.#client instanceof Redis) {
      await this.#client.del(fullKey);
    } else {
      await this.#client.delete(fullKey);
    }
  }
}

export const kv = new KV();
