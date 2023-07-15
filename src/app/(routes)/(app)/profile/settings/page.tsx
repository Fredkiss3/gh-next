import * as React from "react";
import { getUserOrRedirect } from "~/app/(actions)/auth";

export default async function Page() {
  await getUserOrRedirect("/profile/settings");

  return (
    <>
      <h1 className="text-4xl">SETTINGS</h1>
    </>
  );
}
