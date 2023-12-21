"use client";
import * as React from "react";

// components
import { ThemeCard } from "./theme-card";

// utils
import { updateTheme } from "~/app/(actions)/theme.action";

// types
import type { Theme } from "~/app/(actions)/theme.action";
import { SubmitButton } from "./submit-button";

export type ThemeFormProps = {
  theme?: Theme;
};

export function ThemeForm({ theme }: ThemeFormProps) {
  return (
    <form
      action={updateTheme}
      className="flex flex-col items-center gap-4 md:items-start md:gap-8"
    >
      <fieldset className="flex flex-col flex-wrap items-stretch gap-4 sm:flex-row sm:items-start">
        <ThemeCard value="light" defaultSelected={theme === "light"} />
        <ThemeCard value="dark" defaultSelected={theme === "dark"} />
        <ThemeCard value="system" defaultSelected={theme === "system"} />
      </fieldset>
      <SubmitButton loadingMessage="Updating...">Change theme</SubmitButton>
    </form>
  );
}
