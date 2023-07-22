"use client";
import * as React from "react";

// components
import { ThemeCard } from "./theme-card";

// utils
import { updateTheme } from "~/app/(actions)/theme";

// types
import type { Theme } from "~/app/(actions)/theme";
import { useForm } from "~/lib/hooks/use-form";
import { Button } from "./button";

export type ThemeFormProps = {
  theme: Theme;
};

export function ThemeForm({ theme }: ThemeFormProps) {
  const { Form, isPending } = useForm(updateTheme);

  return (
    <Form className="flex flex-col gap-4 items-center md:gap-8 md:items-start">
      <div className="flex items-start gap-4 flex-wrap">
        <ThemeCard value="light" defaultSelected={theme === "light"} />
        <ThemeCard value="dark" defaultSelected={theme === "dark"} />
        <ThemeCard value="system" defaultSelected={theme === "system"} />
      </div>

      <Button type="submit" isBlock isLoading={isPending}>
        {isPending ? "Updating..." : "Change theme"}
      </Button>
    </Form>
  );
}
