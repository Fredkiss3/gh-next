"use client";
import * as React from "react";

// components
import { ThemeCard } from "./theme-card";
import { Button } from "./button";

// utils
import { updateTheme } from "~/app/(actions)/theme";

// types
import type { Theme } from "~/app/(actions)/theme";
import { SubmitButton } from "./submit-button";

export type ThemeFormProps = {
  theme?: Theme;
};

export function ThemeForm({ theme }: ThemeFormProps) {
  return (
    <form
      action={updateTheme}
      className="flex flex-col gap-4 items-center md:gap-8 md:items-start"
    >
      <fieldset className="flex flex-col items-stretch sm:flex-row sm:items-start gap-4 flex-wrap">
        <ThemeCard value="light" defaultSelected={theme === "light"} />
        <ThemeCard value="dark" defaultSelected={theme === "dark"} />
        <ThemeCard value="system" defaultSelected={theme === "system"} />
      </fieldset>
      <SubmitButton loadingText="Updating...">Change theme</SubmitButton>
    </form>
  );
}
