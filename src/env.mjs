// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const kvSchema = z.union([
  z.object({
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string(),
    KV: z.undefined(),
  }),
  z.object({
    KV: z.object({
      get: z.function(),
    }),
  }),
]);

export const env = createEnv({
  server: {
    TURSO_DB_TOKEN: z.string(),
    TURSO_DB_URL: z.string().url(),
    SESSION_SECRET: z.string().min(32).max(32),
    KV_PREFIX: z.string(),
    GITHUB_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_REDIRECT_URI: z.string().url(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    KV: z.any().optional(),
  },
  client: {},
  runtimeEnv: {
    SESSION_SECRET: process.env.SESSION_SECRET,
    TURSO_DB_TOKEN: process.env.TURSO_DB_TOKEN,
    TURSO_DB_URL: process.env.TURSO_DB_URL,
    KV_PREFIX: process.env.KV_PREFIX,
    KV: process.env.KV,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,
  },
});
