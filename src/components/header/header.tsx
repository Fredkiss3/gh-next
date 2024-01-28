import "server-only";
import * as React from "react";

// components
import {
  CommandPaletteIcon,
  InboxIcon,
  IssueOpenedIcon,
  MarkGithubIcon,
  PlusIcon,
  SearchIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { Input } from "~/components/input";
import { Button } from "~/components/button";

import {
  UserDropdown,
  preloadAuthedUser
} from "~/components/user-dropdown/user-dropdown.server";

// utils
import { getSession } from "~/actions/session.action";
import { clsx } from "~/lib/shared/utils.shared";

// types
export type HeaderProps = {
  hideRepoNavbar?: boolean;
  children?: React.ReactNode;
  pageTitle?: React.ReactNode;
};

export async function Header({ children, pageTitle }: HeaderProps) {
  const { user } = await getSession();

  if (user) {
    // preload the user so that it is accessed faster in <UserDropdown />
    preloadAuthedUser();
  }

  return (
    <header className={clsx("bg-header border-b border-neutral text-sm")}>
      <div
        className={clsx(
          "z-5 relative flex h-16 items-center justify-between bg-header px-5 py-4",
          "md:px-8"
        )}
      >
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Link href="/">
            <MarkGithubIcon className="h-10 w-10" />
          </Link>

          {pageTitle}
        </div>

        <nav className="flex h-full items-center gap-2">
          <Input
            name="search"
            label="search input"
            hideLabel
            size="medium"
            className="hidden md:flex"
            placeholder="type / to search"
            renderLeadingIcon={(cls) => <SearchIcon className={cls} />}
            renderTrailingIcon={(cls) => <CommandPaletteIcon className={cls} />}
          />

          <div
            className="hidden h-full w-[1px] self-stretch bg-neutral md:block"
            aria-hidden="true"
          />

          <ul className="flex h-full items-center gap-2">
            <li className="hidden md:block">
              <Button
                isSquared
                href="/issues/new"
                variant="invisible"
                renderLeadingIcon={(cls) => <PlusIcon className={cls} />}
              >
                <span className="sr-only">New issue</span>
              </Button>
            </li>

            <li>
              <Button
                isSquared
                href="/issues"
                variant="invisible"
                renderLeadingIcon={(cls) => <IssueOpenedIcon className={cls} />}
              >
                <span className="sr-only">Issues</span>
              </Button>
            </li>

            <li>
              <Button
                isSquared
                href="/notifications"
                variant="invisible"
                renderLeadingIcon={(cls) => <InboxIcon className={cls} />}
              >
                <span className="sr-only">Notifications</span>
              </Button>
            </li>
          </ul>

          {user ? (
            <UserDropdown />
          ) : (
            <Button
              className="flex-shrink-0 min-w-max !border-foreground !text-foreground"
              href="/login"
              variant="invisible"
            >
              Sign in
            </Button>
          )}
        </nav>
      </div>

      {children}
    </header>
  );
}
