"use client";
import * as React from "react";
// components
import { DropdownMenu } from "../dropdown-menu";
import { Avatar } from "../avatar";
import {
  PaintbrushIcon,
  PersonIcon,
  SignOutIcon,
} from "@primer/octicons-react";

// utils
import { logoutUser } from "~/app/(actions)/auth";

// types
export type UserDropdownProps = {
  avatar_url: string;
  username: string;
};

export function UserDropdown({ avatar_url, username }: UserDropdownProps) {
  const [_, startTransition] = React.useTransition();
  return (
    <DropdownMenu
      items={[
        {
          id: "account",
          href: "/settings/account",
          text: "Your account",
          icon: PersonIcon,
        },
        {
          id: "appearance",
          href: "/settings/appearance",
          text: "Change Theme",
          icon: PaintbrushIcon,
        },
        {
          id: "sign-out",
          text: "Sign out",
          icon: SignOutIcon,
          onClick: async () => {
            startTransition(() => logoutUser());
          },
        },
      ]}
    >
      <Avatar username={username} src={avatar_url} />
    </DropdownMenu>
  );
}
