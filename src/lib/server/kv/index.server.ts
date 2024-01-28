import "server-only";
import { WebdisKV } from "./webdis.server.mjs";

export interface KVStore {
  set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number,
    key_prefix?: string
  ): Promise<void>;
  get<T extends Record<string, any> = {}>(
    key: string,
    key_prefix?: string
  ): Promise<T | null>;
  delete(key: string, key_prefix?: string): Promise<void>;
}

function getKV(): KVStore {
  return new WebdisKV();
}

export const kv = getKV();
