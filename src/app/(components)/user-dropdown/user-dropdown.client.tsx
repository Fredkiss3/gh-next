"use client";
import * as React from "react";
import * as ReactDOM from "react-dom";
// components
import { Avatar } from "~/app/(components)/avatar";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownSeparator,
  DropdownTrigger
} from "~/app/(components)/dropdown";
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
  const [, startTransition] = React.useTransition();
  const [canInjectMentionStyles, setCanInjectMentionStyles] =
    React.useState(false);

  React.useEffect(() => {
    setCanInjectMentionStyles(true);
  }, []);
  return (
    <>
      {canInjectMentionStyles &&
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

      <DropdownRoot>
        <DropdownTrigger>
          <button
            aria-label="menu"
            className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <Avatar username={username} src={avatar_url} />
          </button>
        </DropdownTrigger>
        <DropdownContent align="end" className="min-w-[180px]">
          <DropdownItem
            icon={PersonIcon}
            text="Your account"
            href="/settings/account"
          />
          <DropdownItem
            icon={PaintbrushIcon}
            text="Change Theme"
            href="/settings/appearance"
          />
          <DropdownSeparator />
          <DropdownItem
            icon={SignOutIcon}
            text="Sign out"
            onClick={() => startTransition(() => void logoutUser())}
          />
        </DropdownContent>
      </DropdownRoot>
    </>
  );
}
