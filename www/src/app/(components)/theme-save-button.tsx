"use client";
import * as React from "react";
import { Button } from "./button";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

export type ThemeSaveButtonProps = {
  className?: string;
};

export function ThemeSaveButton({ className }: ThemeSaveButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button className={className} type="submit" isBlock isLoading={pending}>
      {pending ? "Updating..." : "Change theme"}
    </Button>
  );
}
