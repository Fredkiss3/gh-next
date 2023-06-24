// import { z } from "zod";
const { createEnv } = require("@t3-oss/env-nextjs");
const { z } = require("zod");

const env = createEnv({
  server: {
    DB: z.any().optional(),
    JWT_SECRET: z.string().min(32).max(32),
  },
  client: {},
  runtimeEnv: {
    DB: process.env.DB,
    JWT_SECRET: process.env.JWT_SECRET,
  },
});

module.exports = {
  env,
};
