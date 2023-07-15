"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { THEME_COOKIE_KEY } from "~/lib/constants";

const themeSchema = z
  .union([z.literal("dark"), z.literal("light"), z.literal("system")])
  .optional()
  .default("system")
  .catch("system");

export type Theme = z.TypeOf<typeof themeSchema>;

export async function getTheme() {
  return themeSchema.parse(cookies().get(THEME_COOKIE_KEY)?.value);
}
