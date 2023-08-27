import { env } from "~/env.mjs";
import { WebdisKV } from "./redis-web";

export interface KVStore {
  set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number
  ): Promise<void>;
  get<T extends Record<string, any> = {}>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

function getKV(): KVStore {
  return new WebdisKV();
}

export const kv = getKV();
