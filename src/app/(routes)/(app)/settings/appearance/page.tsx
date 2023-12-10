/* eslint-disable @next/next/no-img-element */
import * as React from "react";

// components
import { ThemeForm } from "~/app/(components)/theme-form";

// utils
import { getUserOrRedirect } from "~/app/(actions)/auth.action";
import { getTheme } from "~/app/(actions)/theme.action";

// types
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Appearance"
};

export default async function AppearanceSettingsPage() {
  await getUserOrRedirect("/settings/appearance");
  const theme = await getTheme();
  return (
    <div>
      <section className="flex flex-col gap-4 md:gap-8">
        <h2 className="border-b border-neutral py-2.5 text-2xl font-medium">
          Theme preferences
        </h2>

        <p>
          Choose how GitHub looks to you. Select a single theme, or sync with
          your system and automatically switch between day and night themes.
        </p>

        <ThemeForm theme={theme} />
      </section>
    </div>
  );
}
