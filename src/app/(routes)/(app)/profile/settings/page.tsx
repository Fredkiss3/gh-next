import * as React from "react";
import { getAuthenticatedUser } from "~/app/(actions)/auth";

export default async function Page() {
  await getAuthenticatedUser(`/profile/settings`);

  return (
    <>
      <h1 className="text-4xl">SETTINGS</h1>
    </>
  );
}
