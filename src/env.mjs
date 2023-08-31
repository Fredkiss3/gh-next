// @ts-check
import { createEnv } from "@t3-oss/env-nextjs";
import { preprocess, z } from "zod";

export const env = createEnv({
  server: {
    SESSION_SECRET: z.string().min(32).max(32),
    GITHUB_SECRET: z.string(),
    KV_PREFIX: z.string().optional().default(""),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_REDIRECT_URI: z.string().url(),
    GITHUB_PERSONAL_ACCESS_TOKEN: z.string(),
    REDIS_HTTP_URL: z.string().url().optional(),
    REDIS_HTTP_USERNAME: z.string().optional(),
    REDIS_HTTP_PASSWORD: z.string().optional(),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().url(),
  },
  client: {
    NEXT_PUBLIC_VERCEL_URL: preprocess((arg) => {
      if (!arg) return arg;
      // @ts-expect-error
      const protocol = arg.startsWith("localhost") ? "http" : "https";
      return `${protocol}://${arg}`;
    }, z.string().url()),
  },
  runtimeEnv: {
    KV_PREFIX: process.env.KV_PREFIX,
    REDIS_URL: process.env.REDIS_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_HTTP_URL: process.env.REDIS_HTTP_URL,
    REDIS_HTTP_USERNAME: process.env.REDIS_HTTP_USERNAME,
    REDIS_HTTP_PASSWORD: process.env.REDIS_HTTP_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    GITHUB_SECRET: process.env.GITHUB_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_PERSONAL_ACCESS_TOKEN,
  },
});
