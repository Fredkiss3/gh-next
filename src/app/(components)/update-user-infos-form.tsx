"use client";
import * as React from "react";

// components
import { Button } from "./button";
import { Input } from "./input";
import { Textarea } from "./textarea";

// utils
import { updateUserProfile } from "~/app/(actions)/auth";
import { useRouter } from "next/navigation";

// types
import type { FormErrors } from "~/lib/types";
import type { UpdateUserProfileInfos } from "~/app/(actions)/auth";

export type UpdateUserInfosProps = {
  defaultValues: UpdateUserProfileInfos;
  errors?: FormErrors;
};

export function UpdateUserInfosForm({
  defaultValues,
  errors
}: UpdateUserInfosProps) {
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
      action={updateUserProfile}
      className="flex flex-col items-stretch gap-4 md:items-start"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(() => updateUserProfile(new FormData(e.currentTarget)));
      }}
    >
      <Input
        name="name"
        label="New name"
        placeholder="ex: Sha-dcn"
        defaultValue={defaultValues.name}
        validationStatus={!!errors?.name ? "error" : undefined}
        validationText={errors?.name}
        helpText="Your name may appear around this website where you are mentioned. You can remove it at any time."
      />

      <div className="grid w-full gap-x-8 gap-y-4 md:grid-cols-2">
        <Input
          name="company"
          label="Company"
          placeholder="ex: Google"
          defaultValue={defaultValues.company}
          validationStatus={!!errors?.company ? "error" : undefined}
          validationText={errors?.company}
        />

        <Input
          name="location"
          label="Location"
          placeholder="ex: France"
          defaultValue={defaultValues.location}
          validationStatus={!!errors?.location ? "error" : undefined}
          validationText={errors?.location}
        />
      </div>

      <Textarea
        name="bio"
        label="Bio"
        placeholder="ex: Sha-dcn"
        defaultValue={defaultValues.bio}
        validationStatus={!!errors?.bio ? "error" : undefined}
        validationText={errors?.bio}
        className="col-span-2"
        rows={5}
      />

      <Button isLoading={isPending} variant="primary" type="submit">
        {isPending ? "Updating..." : "Update your profile"}
      </Button>
    </form>
  );
}
