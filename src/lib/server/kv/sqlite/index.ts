import { eq, sql } from "drizzle-orm";
import { kvEntry } from "./kv-entry.sql";
import { db } from "~/lib/server/db/index.server";

import type { KVStore } from "~/lib/server/kv/index.server";

// export class SqliteKV implements KVStore {
//   public async get<T extends Record<string, any> = {}>(
//     key: string
//   ): Promise<T | null> {
//     const time = Date.now();
//     console.time(`[KV sqlite] GET ${key} - @${time}`);
//     const entry = await db
//       .select()
//       .from(kvEntry)
//       .where(
//         sql`${kvEntry.key} = ${key} AND (${kvEntry.expiry} > strftime('%s', 'now') OR ${kvEntry.expiry} IS NULL)`
//       )
//       .all();

//     console.timeEnd(`[KV sqlite] GET ${key} - @${time}`);
//     if (entry.length === 0) return null;

//     return JSON.parse(entry[0].value) as T;
//   }

//   public async set<T extends Record<string, any> = {}>(
//     key: string,
//     value: T,
//     ttl_in_seconds?: number | undefined
//   ): Promise<void> {
//     const time = Date.now();
//     console.time(`[KV sqlite] SET ${key} - @${time}`);
//     const newData = {
//       expiry: ttl_in_seconds
//         ? new Date(Date.now() + ttl_in_seconds * 1000)
//         : null,
//       value: JSON.stringify(value),
//     };
//     await db
//       .insert(kvEntry)
//       .values({
//         key,
//         ...newData,
//       })
//       .onConflictDoUpdate({
//         target: kvEntry.key,
//         set: {
//           ...newData,
//         },
//       })
//       .run();
//     console.timeEnd(`[KV sqlite] SET ${key} - @${time}`);
//   }

//   public async delete(key: string): Promise<void> {
//     const time = Date.now();
//     console.timeEnd(`[KV sqlite] DELETE ${key} - @${time}`);
//     await db.delete(kvEntry).where(eq(kvEntry.key, key)).run();
//     console.timeEnd(`[KV sqlite] DELETE ${key} - @${time}`);
//   }

//   public async deleteExpiredCacheEntries() {
//     await db
//       .delete(kvEntry)
//       .where(sql`${kvEntry.expiry} < strftime('%s', 'now')`)
//       .run();
//   }
// }
