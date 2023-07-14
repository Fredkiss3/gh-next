"use client";
import * as React from "react";
// components
import { DropdownMenu } from "./dropdown-menu";
import { Avatar } from "./avatar";
import {
  GearIcon,
  PersonIcon,
  SignOutIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";

// utils
import { useRouter } from "next/navigation";
import { logoutUser } from "~/app/(actions)/auth";
import { Button } from "./button";

// types
export type UserDropdownProps = {
  avatar_url: string;
  username: string;
};

export function UserDropdown({ avatar_url, username }: UserDropdownProps) {
  const router = useRouter();
  return (
    <DropdownMenu
      className="min-w-fit"
      items={[
        {
          href: "/profile",
          text: "Your profile",
          icon: PersonIcon,
        },
        {
          href: "/profile/settings",
          text: "Settings",
          icon: GearIcon,
        },
        {
          text: "Sign out",
          icon: SignOutIcon,
          onClick: async () => {
            React.startTransition(
              () =>
                void logoutUser().then(() => {
                  router.refresh();
                })
            );
          },
        },
      ]}
    >
      <Button
        type="button"
        variant="invisible"
        isSquared
        renderTrailingIcon={(cls) => <TriangleDownIcon className={cls} />}
      >
        <Avatar username={username} src={avatar_url} />
      </Button>
    </DropdownMenu>
  );
}
