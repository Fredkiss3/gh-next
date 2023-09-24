import * as React from "react";

// components
import {
  CommandPaletteIcon,
  GitPullRequestIcon,
  InboxIcon,
  IssueOpenedIcon,
  MarkGithubIcon,
  PlusIcon,
  SearchIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { Input } from "./input";
import { Button } from "./button";
import { HeaderUnderlineNavbar } from "./underline-navbar";
import {
  UserDropdown,
  UserDropdownSkeleton
} from "./user-dropdown/user-dropdown.server";

// utils
import { getSession } from "~/app/(actions)/auth";
import { clsx } from "~/lib/shared/utils.shared";
import { PageTitle } from "./page-title";
import { getOpenIssuesCount } from "~/app/(models)/issues";

// types
export type HeaderProps = {
  hideRepoNavbar?: boolean;
};

export async function Header({ hideRepoNavbar = false }: HeaderProps) {
  const { user } = await getSession();
  const noOfOpennedIssues = await getOpenIssuesCount();

  return (
    <header
      className={clsx({
        "border-b border-neutral": hideRepoNavbar
      })}
    >
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

          <PageTitle />
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

            <li className="hidden md:block">
              <Button
                isSquared
                href="/pulls"
                variant="invisible"
                renderLeadingIcon={(cls) => (
                  <GitPullRequestIcon className={cls} />
                )}
              >
                <span className="sr-only">Pull Requests</span>
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
            <React.Suspense fallback={<UserDropdownSkeleton />}>
              <UserDropdown />
            </React.Suspense>
          ) : (
            <Button
              className="flex-shrink-0 !border-foreground !text-foreground"
              href="/login"
              variant="invisible"
            >
              Sign in
            </Button>
          )}
        </nav>
      </div>

      <HeaderUnderlineNavbar
        className="bg-header"
        noOfOpennedIssues={noOfOpennedIssues}
      />
    </header>
  );
}
