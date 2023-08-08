import { env } from "~/env.mjs";
import { HttpKV } from "./http";
import { SqliteKV } from "./sqlite";
import { CloudfareKV } from "./cloudfare";

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
  if (process.env.NODE_ENV === "development") {
    return new HttpKV();
  } else if (env.KV) {
    return new CloudfareKV();
  } else {
    return new SqliteKV();
  }
}

export const kv = getKV();
