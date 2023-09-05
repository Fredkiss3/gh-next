"use client";
import * as React from "react";
// components
import { Button } from "./button";
import { Input } from "./input";

// utils
import { updateUserName } from "~/app/(actions)/auth";
import { useRouter } from "next/navigation";

// types
import type { FormErrors } from "~/lib/types";

export type ChangeUsernameFormProps = {
  defaultValue: string;
  errors?: FormErrors;
};

export function ChangeUsernameForm({
  defaultValue,
  errors
}: ChangeUsernameFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const router = useRouter();

  React.useEffect(() => {
    return () => {
      if (errors) {
        // Refresh the router because we don't want to keep old values on mount (errors, defaultValue)
        return React.startTransition(() => router.refresh());
      }
    };
  }, [router, errors]);

  return (
    <form
      action={updateUserName}
      className="flex flex-col items-stretch gap-4 md:items-start"
      onSubmit={(e) => {
        // we stop the event because we want the user to confirm their actino before submiting
        e.preventDefault();

        if (confirm("Are you sure about this ?")) {
          startTransition(() => updateUserName(new FormData(e.currentTarget)));
        }
      }}
    >
      <Input
        name="username"
        label="New username"
        placeholder="ex: johndoe"
        required
        defaultValue={defaultValue}
        validationStatus={!!errors?.username ? "error" : undefined}
        validationText={errors?.username}
        helpText="must be an alphanumeric character without any space or special chars, starting with a letter"
      />
      <Button isLoading={isPending} variant="subtle" type="submit">
        {isPending ? "Updating your username..." : "Change username"}
      </Button>
    </form>
  );
}
