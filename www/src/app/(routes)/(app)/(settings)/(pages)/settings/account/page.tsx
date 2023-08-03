import * as React from "react";

// components
import { ChangeUsernameForm } from "~/app/(components)/change-username-form";

// utils
import {
  getAuthedUser,
  getSession,
  redirectIfNotAuthed,
} from "~/app/(actions)/auth";

// types
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account settings",
};

export default async function Page() {
  await redirectIfNotAuthed("/settings/account");

  const user = (await getAuthedUser())!;
  const formData = await getSession().then((s) => s.getFormData());

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-4 md:gap-8">
        <h2 className="text-3xl font-medium border-b border-neutral py-2.5">
          Change username
        </h2>

        <p>
          Changing your username means that all the mentions (
          <strong>@{user.username}</strong>) would be lost
        </p>

        <ChangeUsernameForm
          errors={formData?.errors}
          defaultValue={formData?.data?.username?.toString() ?? user.username}
        />
      </section>
    </div>
  );
}
