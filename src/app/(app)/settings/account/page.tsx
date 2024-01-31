import * as React from "react";

// components
import { UpdateUserInfosForm } from "~/components/update-user-infos-form";
import { Button } from "~/components/button";

// utils
import { getUserOrRedirect } from "~/actions/auth.action";
import { updateUserProfileInfosInputValidator } from "~/models/dto/update-profile-info-input-validator";

// types
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account settings"
};

export default async function AccountSettingsPage() {
  const user = await getUserOrRedirect("/settings/account");

  return (
    <div className="flex flex-col gap-24">
      <section className="flex flex-col gap-4 md:gap-8">
        <h2 className="border-b border-neutral pb-2.5 text-3xl font-medium">
          Update your public profile
        </h2>

        <p>
          Changing informations on this website won&rsquo;t affect your real
          informations on github. Every data is stored in our database. You can
          request to delete your informations in the form below.
        </p>

        <UpdateUserInfosForm
          defaultValues={updateUserProfileInfosInputValidator.parse(user)}
        />
      </section>

      <section className="flex flex-col gap-4 md:gap-8">
        <h2 className="border-b border-neutral py-2.5 text-3xl font-medium text-danger">
          Danger Zone
        </h2>

        <div className="rounded-md border border-danger p-4">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-semibold">Delete your account</h3>
              <p>
                This will delete your mentions, comments and issues references
                in this website. It won&rsquo;t have any effect on your real
                github account
              </p>
            </div>

            <form className="flex flex-shrink-0">
              <Button variant="danger" disabled>
                Delete your account
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
