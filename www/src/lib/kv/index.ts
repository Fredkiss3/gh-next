import { HttpKV } from "./http";
import { SqliteKV } from "./sqlite";

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
  // if (process.env.NODE_ENV === "development") {
  //   return new HttpKV();
  // }
  return new SqliteKV();
}

export const kv = getKV();
