import "server-only";
import * as React from "react";
import { getAuthedUser } from "~/app/(actions)/auth";
import { UserDropdown as UserDropdownClient } from "./user-dropdown.client";
import { Button } from "~/app/(components)/button";

export async function UserDropdown() {
  const user = await getAuthedUser();
  return user ? (
    <UserDropdownClient avatar_url={user.avatar_url} username={user.username} />
  ) : (
    <Button
      className="flex-shrink-0 !border-foreground !text-foreground"
      href="/login"
      variant="invisible"
    >
      Sign in
    </Button>
  );
}
export async function UserDropdownSkeleton() {
  return (
    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-grey" />
  );
}
