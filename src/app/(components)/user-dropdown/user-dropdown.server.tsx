import * as React from "react";
import { getAuthedUser } from "~/app/(actions)/auth";
import { UserDropdown as UserDropdownClient } from "./user-dropdown.client";

export async function UserDropdown() {
  const user = await getAuthedUser();
  if (!user) return null;

  return (
    <UserDropdownClient avatar_url={user.avatar_url} username={user.username} />
  );
}
export async function UserDropdownSkeleton() {
  return (
    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-grey" />
  );
}
