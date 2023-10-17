"use client";
import * as React from "react";
import { useFormState } from "react-dom";

// components
import { Input } from "./input";
import { Textarea } from "./textarea";
import { SubmitButton } from "./submit-button";

// utils
import { updateUserProfile } from "~/app/(actions)/user";

// types
import type { UpdateUserProfileInfosInput } from "~/app/(models)/dto/update-profile-info-input-validator";

export type UpdateUserInfosProps = {
  defaultValues: UpdateUserProfileInfosInput;
};

export function UpdateUserInfosForm({ defaultValues }: UpdateUserInfosProps) {
  const [state, formAction] = useFormState(updateUserProfile, {
    message: null,
    type: undefined
  });

  defaultValues =
    state?.type === "error"
      ? (state.formData as UpdateUserProfileInfosInput)
      : defaultValues;

  const errors = state.type !== "error" ? null : state.fieldErrors;

  return (
    <form
      action={formAction}
      className="flex flex-col items-stretch gap-4 md:items-start"
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
        placeholder="ex: I am a code monkey 🙈👨🏾‍💻"
        defaultValue={defaultValues.bio}
        validationStatus={!!errors?.bio ? "error" : undefined}
        validationText={errors?.bio}
        className="col-span-2"
        rows={5}
      />

      <SubmitButton loadingMessage="Updating...">
        Update your profile
      </SubmitButton>
    </form>
  );
}
