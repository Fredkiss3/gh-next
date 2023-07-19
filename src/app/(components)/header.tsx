import * as React from "react";

// components
import {
  CommandPaletteIcon,
  GitPullRequestIcon,
  InboxIcon,
  IssueOpenedIcon,
  MarkGithubIcon,
  PlusIcon,
  SearchIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { Input } from "./input";
import { Button } from "./button";
import { UserDropdown } from "./user-dropdown";
import { UnderlineNavbar } from "./underline-navbar";

// utils
import { getSession } from "~/app/(actions)/auth";
import { clsx } from "~/lib/functions";

// types
export type HeaderProps = {};

export async function Header({}: HeaderProps) {
  const user = await getSession().then((session) => session.user);

  return (
    <header>
      <div
        className={clsx(
          "flex py-4 px-5 items-center justify-between h-16 bg-header relative z-5",
          "md:px-8"
        )}
      >
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Link href="/">
            <MarkGithubIcon className="h-10 w-10" />
          </Link>

          <Link
            href="/"
            className={clsx(
              "py-1 px-2 rounded-md transition duration-150",
              "md:text-lg",
              "hover:bg-neutral/50",
              "flex flex-wrap gap-2"
            )}
          >
            <span
              className={clsx(
                "font-medium text-grey",
                "md:text-foreground md:font-normal"
              )}
            >
              Fredkiss3&nbsp;&nbsp;/
            </span>

            <strong className="font-bold whitespace-nowrap">gh-next</strong>
          </Link>
        </div>

        <nav className="flex items-center gap-2 h-full">
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
            className="hidden md:block h-full w-[1px] bg-neutral self-stretch"
            aria-hidden="true"
          />

          <ul className="flex items-center gap-2 h-full">
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

            <li className="hidden md:block">
              <Button
                isSquared
                // @ts-expect-error route not implemented
                href="/pulls"
                variant="invisible"
                renderLeadingIcon={(cls) => (
                  <GitPullRequestIcon className={cls} />
                )}
              >
                <span className="sr-only">Notifications</span>
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
            <UserDropdown
              avatar_url={user.avatar_url}
              username={user.username}
            />
          ) : (
            <Button
              className="flex-shrink-0 !text-foreground !border-foreground"
              href="/login"
              variant="invisible"
            >
              Sign in
            </Button>
          )}
        </nav>
      </div>

      <UnderlineNavbar className="bg-header" />
    </header>
  );
}
