"use client";
import * as React from "react";

// components
import {
  CheckIcon,
  IssueOpenedIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { IssueAuthorFilterActionList } from "~/app/(components)/issue-list/issue-author-filter-action-list";
import { IssueLabelFilterActionList } from "~/app/(components)/issue-list/issue-label-filter-action-list";
import { IssueAssigneeFilterActionList } from "~/app/(components)/issue-list/issue-assignee-filter-action-list";
import { IssueSortActionList } from "~/app/(components)/issue-list/issue-sort-action-list";
import { Pagination } from "~/app/(components)/pagination";

// utils
import { clsx } from "~/lib/shared/utils.shared";

export type IssueContentTableProps = {
  noOfIssuesOpen: number;
  noOfIssuesClosed: number;
  totalPages: number;
  currentPage: number;
  issues: {}[];
};

export function IssueContentTable({ currentPage }: IssueContentTableProps) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 px-5  md:hidden md:px-0">
        <Link
          prefetch={false}
          href="/issues?q=is:open"
          className={clsx(
            "flex items-center gap-2 font-semibold text-foreground"
          )}
        >
          <IssueOpenedIcon className="h-5 w-5" />
          <p>
            0 <span className="sr-only">issues</span>&nbsp;Open
          </p>
        </Link>
        <Link
          prefetch={false}
          href="/issues?q=is:closed"
          className={clsx("flex items-center gap-2 text-grey")}
        >
          <CheckIcon className="h-5 w-5" />
          <span>
            0 <span className="sr-only">issues</span>&nbsp;Closed
          </span>
        </Link>
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
                  0 <span className="sr-only">issues</span>&nbsp;Open
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
                  0 <span className="sr-only">issues</span>&nbsp;Closed
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
        {/* <EmptyState /> */}

        <ul>
          {/* {issues.map((issue) => (
            <li key={issue.id}>
              <IssueRow {...issue} />
            </li>
          ))} */}
        </ul>

        {/* END Issue content table - list */}
      </div>

      <Pagination
        currentPage={currentPage}
        perPage={5}
        totalCount={50}
        baseURL="/issues?q=is:open&page="
      />
    </>
  );
}
