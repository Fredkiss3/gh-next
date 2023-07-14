import * as React from "react";
import { getAuthenticatedUser } from "~/app/(actions)/auth";
import { LogoutForm } from "./logout-form";

export default async function Page() {
  const user = await getAuthenticatedUser(`/profile`);

  return (
    <>
      <h1 className="text-4xl">PROFILE</h1>

      <pre>
        {JSON.stringify(
          {
            user,
          },
          null,
          2
        )}
      </pre>

      <LogoutForm />
    </>
  );
}
