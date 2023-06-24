import { drizzle as prodDrizzle } from "drizzle-orm/d1";
import { drizzle as localDrizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { env } from "~/env";

import type { LibSQLDatabase } from "drizzle-orm/libsql";
import type { DrizzleD1Database } from "drizzle-orm/d1";

export function getDb(): LibSQLDatabase | DrizzleD1Database {
  if (env.DB) {
    return prodDrizzle(env.DB);
  }

  const client = createClient({ url: "./db.sql" });
  const db = localDrizzle(client);

  return db;
}
