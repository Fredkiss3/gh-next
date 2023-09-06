import * as React from "react";
// components
import { IssueRowSkeleton } from "./issue-row-skeleton";
import {
  CheckIcon,
  IssueOpenedIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import Link from "next/link";

// utils
import { clsx } from "~/lib/shared/utils.shared";

export function IssueContentTableSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 md:hidden md:px-0">
        <div className="flex items-center gap-4">
          <Link
            prefetch={false}
            href="/issues?q=is:open"
            className={clsx(
              "flex items-center gap-2 font-semibold text-foreground"
            )}
          >
            <IssueOpenedIcon className="h-5 w-5" />
            <p>
              - <span className="sr-only">issues</span>&nbsp;Open
            </p>
          </Link>
          <Link
            prefetch={false}
            href="/issues?q=is:closed"
            className={clsx("flex items-center gap-2 text-grey")}
          >
            <CheckIcon className="h-5 w-5" />
            <span>
              - <span className="sr-only">issues</span>&nbsp;Closed
            </span>
          </Link>
        </div>
      </div>

      <div className={clsx("border border-neutral", "sm:rounded-md")}>
        {/* Issue content table - header */}
        <div
          className={clsx(
            "flex items-center justify-between gap-8",
            "border-b border-neutral bg-subtle p-5 text-grey"
          )}
        >
          <ul className="hidden items-center gap-4 md:flex">
            <li>
              <Link
                prefetch={false}
                href="/issues?q=is:open"
                className={clsx(
                  "flex items-center gap-2 font-semibold text-foreground"
                )}
              >
                <IssueOpenedIcon className="h-5 w-5" />
                <p>
                  - <span className="sr-only">issues</span>&nbsp;Open
                </p>
              </Link>
            </li>
            <li>
              <Link
                prefetch={false}
                href="/issues?q=is:closed"
                className={clsx("flex items-center gap-2 text-grey")}
              >
                <CheckIcon className="h-5 w-5" />
                <span>
                  - <span className="sr-only">issues</span>&nbsp;Closed
                </span>
              </Link>
            </li>
          </ul>

          <ul
            className={clsx(
              "flex flex-grow items-center justify-evenly gap-6",
              "sm:justify-start",
              "md:flex-grow-0"
            )}
          >
            <li>
              <button className="flex items-center gap-2">
                <span>Author</span> -
              </button>
            </li>
            <li>
              <button className="flex items-center gap-2">
                <span>Label</span> -
              </button>
            </li>
            <li>
              <button className="flex items-center gap-2">
                <span>Assignee</span> -
              </button>
            </li>
            <li>
              <button className="flex items-center gap-2">
                <span>Sort</span> -
              </button>
            </li>
          </ul>
        </div>
        {/* END Issue content table - header */}

        {/* Issue content table - list */}
        <ul>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
        </ul>
        {/* END Issue content table - list */}
      </div>
    </>
  );
}
