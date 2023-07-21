"use client";
import * as React from "react";
import { Button } from "./button";
import { experimental_useFormStatus as useFormStatus } from "react-dom";

export function ThemeSaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isBlock isLoading={pending}>
      {pending ? "Updating..." : "Change theme"}
    </Button>
  );
}
