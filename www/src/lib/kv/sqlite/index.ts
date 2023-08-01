import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "~/env.mjs";
import { eq, sql } from "drizzle-orm";

import { kvEntry } from "./kv-entry.sql";

import type { KVStore } from "~/lib/kv";

export class SqliteKV implements KVStore {
  #db: ReturnType<typeof drizzle>;

  constructor() {
    const client = createClient({
      url: env.TURSO_DB_URL,
      authToken: env.TURSO_DB_TOKEN,
    });
    this.#db = drizzle(client, {
      logger: true,
    });
  }

  public async get<T extends Record<string, any> = {}>(
    key: string
  ): Promise<T | null> {
    const entry = await this.#db
      .select()
      .from(kvEntry)
      .where(
        sql`${kvEntry.key} = ${key} AND (${kvEntry.expiry} > strftime('%s', 'now') OR ${kvEntry.expiry} IS NULL)`
      )
      .all();
    if (entry.length === 0) return null;

    return JSON.parse(entry[0].value) as T;
  }

  public async set<T extends Record<string, any> = {}>(
    key: string,
    value: T,
    ttl_in_seconds?: number | undefined
  ): Promise<void> {
    const newData = {
      expiry: ttl_in_seconds
        ? new Date(Date.now() + ttl_in_seconds * 1000)
        : null,
      value: JSON.stringify(value),
    };
    await this.#db
      .insert(kvEntry)
      .values({
        key,
        ...newData,
      })
      .onConflictDoUpdate({
        target: kvEntry.key,
        set: {
          ...newData,
        },
      })
      .run();
  }

  public async delete(key: string): Promise<void> {
    await this.#db.delete(kvEntry).where(eq(kvEntry.key, key)).run();
  }

  public async deleteExpiredCacheEntries() {
    await this.#db
      .delete(kvEntry)
      .where(sql`${kvEntry.expiry} < strftime('%s', 'now')`)
      .run();
  }
}
