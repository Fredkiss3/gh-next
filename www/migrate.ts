import { migrate } from "drizzle-orm/libsql/migrator";
import { env } from "~/env.mjs";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const db = drizzle(
  createClient({
    url: env.TURSO_DB_URL,
    authToken: env.TURSO_DB_TOKEN,
  })
);

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
  process.exit(0);
}
main();
