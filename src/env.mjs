// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    TURSO_DB_TOKEN: z.string(),
    TURSO_DB_URL: z.string().url(),
    JWT_SECRET: z.string().min(32).max(32),
  },
  client: {},
  runtimeEnv: {
    JWT_SECRET: process.env.JWT_SECRET,
    TURSO_DB_TOKEN: process.env.TURSO_DB_TOKEN,
    TURSO_DB_URL: process.env.TURSO_DB_URL,
  },
});
