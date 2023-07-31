import * as React from "react";
import type { PageProps } from "~/lib/types";

export default async function UserPage({
  params: { username },
}: PageProps<{ username: string }>) {
  return (
    <>
      <h1>User {username}</h1>
    </>
  );
}
