"use client";
import * as React from "react";

// components
import {
  CheckIcon,
  IssueOpenedIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { IssueAuthorFilterActionList } from "./issue-author-filter-action-list";
import { IssueLabelFilterActionList } from "./issue-label-filter-action-list";
import { IssueAssigneeFilterActionList } from "./issue-assignee-filter-action-list";
import { IssueSortActionList } from "./issue-sort-action-list";
import { Pagination } from "~/app/(components)/pagination";
import { IssueRow } from "./issue-row";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { useSearchParams } from "next/navigation";
import { clsx, pluralize } from "~/lib/shared/utils.shared";

// types
import type { IssueListResult } from "~/lib/server/dto/issue-list.server";

export type IssueListClientProps = IssueListResult & { currentPage: number };

export function IssueListClient({
  currentPage,
  issues,
  totalCount,
  noOfIssuesClosed,
  noOfIssuesOpen
}: IssueListClientProps) {
  const sp = useSearchParams();
  const baseURL = sp.get("q") ? `?q=${sp.get("q")}&page=` : `?page=`;

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 px-5  md:hidden md:px-0">
        <IssueSearchLink
          className={clsx(
            "flex items-center gap-2 font-semibold text-foreground"
          )}
        >
          <IssueOpenedIcon className="h-5 w-5" />
          <p>
            {noOfIssuesOpen}&nbsp;
            <span className="sr-only">
              {pluralize("issue", noOfIssuesOpen)}
            </span>
            &nbsp;Open
          </p>
        </IssueSearchLink>
        <IssueSearchLink
          filters={{
            is: "closed"
          }}
          className={clsx("flex items-center gap-2 text-grey")}
        >
          <CheckIcon className="h-5 w-5" />
          <span>
            {noOfIssuesClosed}&nbsp;
            <span className="sr-only">
              {pluralize("issue", noOfIssuesClosed)}
            </span>
            &nbsp;Closed
          </span>
        </IssueSearchLink>
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
              <IssueSearchLink
                className={clsx(
                  "flex items-center gap-2 font-semibold text-foreground"
                )}
              >
                <IssueOpenedIcon className="h-5 w-5" />
                <p>
                  {noOfIssuesOpen}&nbsp;
                  <span className="sr-only">
                    {pluralize("issue", noOfIssuesOpen)}
                  </span>
                  &nbsp;Open
                </p>
              </IssueSearchLink>
            </li>
            <li>
              <IssueSearchLink
                filters={{
                  is: "closed"
                }}
                className={clsx("flex items-center gap-2 text-grey")}
              >
                <CheckIcon className="h-5 w-5" />
                <span>
                  {noOfIssuesClosed}&nbsp;
                  <span className="sr-only">
                    {pluralize("issue", noOfIssuesClosed)}
                  </span>
                  &nbsp;Closed
                </span>
              </IssueSearchLink>
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
              <IssueAuthorFilterActionList>
                <button className="flex items-center gap-2">
                  <span>Author</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueAuthorFilterActionList>
            </li>
            <li>
              <IssueLabelFilterActionList>
                <button className="flex items-center gap-2">
                  <span>Label</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueLabelFilterActionList>
            </li>
            <li>
              <IssueAssigneeFilterActionList>
                <button className="flex items-center gap-2">
                  <span>Assignee</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueAssigneeFilterActionList>
            </li>
            <li>
              <IssueSortActionList>
                <button className="flex items-center gap-2">
                  <span>Sort</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueSortActionList>
            </li>
          </ul>
        </div>
        {/* END Issue content table - header */}

        {/* Issue content table - list */}
        {issues.length === 0 ? (
          <EmptyState />
        ) : (
          <ul>
            {issues.map((issue) => (
              <li key={issue.id}>
                <IssueRow {...issue} />
              </li>
            ))}
          </ul>
        )}

        {/* END Issue content table - list */}
      </div>

      {totalCount > 25 && (
        <Pagination
          currentPage={currentPage}
          perPage={25}
          totalCount={totalCount}
          baseURL={`/issues${baseURL}`}
        />
      )}
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-12 py-24">
      <IssueOpenedIcon className="h-6 w-6 text-grey" />

      <h3 className="text-2xl font-semibold">Nothing to see here!</h3>

      <p className="text-center text-lg text-grey">
        Either no issue matched your search or there is not issue yet in the
        database. <br /> You can still &nbsp;
        <Link href="/issues/new" className="text-accent">
          create a new issue
        </Link>
        .
      </p>
    </div>
  );
}
