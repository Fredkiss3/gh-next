"use server";

import { cookies } from "next/headers";
import { z } from "zod";
import { THEME_COOKIE_KEY } from "~/lib/constants";
import { forceRevalidate, ssrRedirect } from "~/lib/server-utils";
import { getSession } from "./auth";
import { cache } from "react";

const themeSchema = z
  .union([z.literal("dark"), z.literal("light"), z.literal("system")])
  .optional()
  .default("system")
  .catch("system");

export type Theme = z.TypeOf<typeof themeSchema>;

export const getTheme = cache(async function getTheme() {
  return themeSchema.parse(cookies().get(THEME_COOKIE_KEY)?.value);
});

export async function updateTheme(formData: FormData) {
  // return themeSchema.parse(cookies().get(THEME_COOKIE_KEY)?.value);
  const themeResult = themeSchema.safeParse(formData.get("theme")?.toString());

  const session = await getSession();
  if (!themeResult.success) {
    await session.addFlash({
      type: "warning",
      message: "Invalid theme provided, please retry",
    });
    await forceRevalidate();
    return;
  }

  const theme = themeResult.data;

  await session.addFlash({
    type: "success",
    message: `Theme changed to ${theme}`,
  });
  cookies().set({
    name: THEME_COOKIE_KEY,
    value: theme,
  });

  ssrRedirect("/settings/appearance");
}
