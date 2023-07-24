import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { env } from "~/env.mjs";
import { drizzle } from "drizzle-orm/postgres-js";

const db = drizzle(postgres(env.NEON_DB_URL, { ssl: "require", max: 1 }));

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
  process.exit(0);
}
main();
