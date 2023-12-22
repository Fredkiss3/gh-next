import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const db = drizzle(postgres(process.env.DATABASE_URL!));

async function main() {
  await migrate(db, { migrationsFolder: "drizzle" });
  process.exit(0);
}
main();
