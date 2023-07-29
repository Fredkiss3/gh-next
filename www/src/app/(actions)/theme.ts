"use server";

import { z } from "zod";
import { forceRevalidate, ssrRedirect, withAuth } from "~/lib/server-utils";
import { getSession } from "./auth";
import { cache } from "react";
import { updateUserTheme } from "~/app/(models)/user";

const themeSchema = z
  .union([z.literal("dark"), z.literal("light"), z.literal("system")])
  .optional()
  .default("system")
  .catch("system");

export type Theme = z.TypeOf<typeof themeSchema>;

export const getTheme = cache(async function getTheme() {
  const user = (await getSession()).user;

  return user?.preferred_theme ?? "system";
});

export const updateTheme = withAuth(async function updateTheme(
  formData: FormData
) {
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

  const user = await updateUserTheme(theme, session.user!.id);
  await session.setUser(user);

  await session.addFlash({
    type: "success",
    message: `Theme changed to ${theme}`,
  });

  ssrRedirect("/settings/appearance");
});
