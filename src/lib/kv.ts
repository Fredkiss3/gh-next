import { Redis } from "@upstash/redis/cloudflare";
import { env } from "~/env.mjs";

class KV {
  #client: KVNamespace | Redis | null = null;

  constructor() {
    if (env.KV) {
      this.#client = env.KV as KVNamespace;
    } else {
      this.#client = Redis.fromEnv(env);
    }
  }

  public async set<T extends any = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number
  ) {
    const fullKey = `${env.KV_PREFIX}${key}`;

    if (env.KV) {
      return (this.#client as KVNamespace).put(
        fullKey,
        JSON.stringify(value),
        ttl_in_seconds
          ? {
              expirationTtl: ttl_in_seconds,
            }
          : undefined
      );
    } else {
      return (this.#client as Redis).set(
        fullKey,
        value,
        ttl_in_seconds
          ? {
              ex: ttl_in_seconds,
            }
          : undefined
      );
    }
  }

  public async get<T extends any = {}>(key: string) {
    const fullKey = `${env.KV_PREFIX}${key}`;

    if (env.KV) {
      return (this.#client as KVNamespace).get(fullKey).then((str) => {
        if (str === null) return null;
        return JSON.parse(str) as T;
      });
    } else {
      return (this.#client as Redis).get<T>(fullKey);
    }
  }

  public async delete(key: string) {
    const fullKey = `${env.KV_PREFIX}${key}`;
    if (env.KV) {
      (this.#client as KVNamespace).delete(fullKey);
    } else {
      (this.#client as Redis).del(fullKey);
    }
  }
}

export const kv = new KV();
