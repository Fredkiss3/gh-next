"use client";
import * as React from "react";
import * as ReactDOM from "react-dom";
// components
import { DropdownMenu } from "../dropdown-menu";
import { Avatar } from "~/app/(components)/avatar";
import {
  PaintbrushIcon,
  PersonIcon,
  SignOutIcon
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
  const [injectStyles, setInjectStyles] = React.useState(false);

  React.useEffect(() => {
    setInjectStyles(true);
  }, []);
  return (
    <>
      {injectStyles &&
        ReactDOM.createPortal(
          <style type="text/css">{`
          .mention-${username} {
            background-color: rgba(var(--severe-color), 0.3);
            padding-left: 0.125rem;
            padding-right: 0.125rem;
            color: rgb(254 249 195);
          }
        `}</style>,
          document.body
        )}
      <DropdownMenu
        items={[
          {
            id: "account",
            href: "/settings/account",
            text: "Your account",
            icon: PersonIcon
          },
          {
            id: "appearance",
            href: "/settings/appearance",
            text: "Change Theme",
            icon: PaintbrushIcon
          },
          {
            id: "sign-out",
            text: "Sign out",
            icon: SignOutIcon,
            onClick: async () => {
              startTransition(() => void logoutUser());
            }
          }
        ]}
      >
        <Avatar username={username} src={avatar_url} />
      </DropdownMenu>
    </>
  );
}
