"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { THEME_COOKIE_KEY } from "~/lib/constants";

const themeSchema = z
  .union([z.literal("DARK"), z.literal("LIGHT"), z.literal("SYSTEM")])
  .optional()
  .default("SYSTEM")
  .catch("SYSTEM")
  .transform((arg) => arg.toLowerCase() as Lowercase<typeof arg>);

export type Theme = z.TypeOf<typeof themeSchema>;

export async function getTheme() {
  return themeSchema.parse(cookies().get(THEME_COOKIE_KEY)?.value);
}
