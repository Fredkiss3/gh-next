/* eslint-disable @next/next/no-img-element */
import * as React from "react";
// components
import { ThemeCard } from "../../../../(components)/theme-card";
import { ThemeSaveButton } from "../../../../(components)/theme-save-button";

// utils
import { getUserOrRedirect } from "../../../../(actions)/auth";
import { getTheme, updateTheme } from "../../../../(actions)/theme";

export default async function Page() {
  await getUserOrRedirect("/settings/appearance");
  const theme = await getTheme();
  return (
    <div>
      <section className="flex flex-col gap-4">
        <h2 className="text-3xl font-medium border-b border-neutral py-2.5">
          Theme preferences
        </h2>

        <p>
          Choose how GitHub looks to you. Select a single theme, or sync with
          your system and automatically switch between day and night themes.
        </p>

        <form action={updateTheme} className="flex flex-col gap-4 items-center">
          <div className="flex items-start gap-4 flex-wrap">
            <ThemeCard value="light" defaultSelected={theme === "light"} />
            <ThemeCard value="dark" defaultSelected={theme === "dark"} />
            <ThemeCard value="system" defaultSelected={theme === "system"} />
          </div>

          <ThemeSaveButton />
        </form>
      </section>
    </div>
  );
}
