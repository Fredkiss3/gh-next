// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NEON_DB_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32).max(32),
    GITHUB_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_REDIRECT_URI: z.string().url(),
    GITHUB_PERSONAL_ACCESS_TOKEN: z.string(),
    KV: z.any(),
    KV_REST_URL: z.string().url().optional(),
  },
  client: {},
  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEON_DB_URL: process.env.NEON_DB_URL,
    KV_REST_URL: process.env.KV_REST_URL,
    KV: process.env.KV,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  },
});
