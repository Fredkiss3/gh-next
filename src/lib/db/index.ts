import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client/http";
import { env } from "~/env";

export const db = drizzle(
  createClient({
    url: env.TURSO_DB_URL!,
    authToken: env.TURSO_DB_TOKEN,
  })
);
