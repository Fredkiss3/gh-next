import * as React from "react";
import { getUserOrRedirect } from "~/app/(actions)/auth";

export default async function Page() {
  const user = await getUserOrRedirect("/settings/account");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col">
        <h2 className="text-3xl font-medium border-b border-neutral py-2.5">
          Change username
        </h2>
      </section>
      <section className="flex flex-col">
        <h2 className="text-3xl text-danger font-semibold border-b border-neutral py-2.5">
          Delete account
        </h2>
      </section>
    </div>
  );
}
