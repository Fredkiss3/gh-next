import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import type { InferModel } from "drizzle-orm";

export const kvEntry = sqliteTable("kv_entries", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  expiry: integer("expiry", { mode: "timestamp" }).default(
    sql`(strftime('%s', 'now'))`
  ),
});

export type KVEntry = InferModel<typeof kvEntry>;
