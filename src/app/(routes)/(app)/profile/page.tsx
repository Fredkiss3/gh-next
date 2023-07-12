import * as React from "react";
import { getSession } from "~/app/(actions)/auth";
import { LogoutForm } from "./logout-form";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();

  if (!session.user) {
    redirect("/login?nextUrl=/profile");
  }

  return (
    <>
      <h1 className="text-4xl">LOGGED IN</h1>

      <pre>
        {JSON.stringify(
          {
            user: session.user,
          },
          null,
          2
        )}
      </pre>

      <LogoutForm />
    </>
  );
}
