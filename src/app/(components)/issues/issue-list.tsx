import "server-only";
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
import {
  clsx,
  parseIssueFilterTokens,
  pluralize
} from "~/lib/shared/utils.shared";
import { preprocess, z } from "zod";
import { getIssueList } from "~/app/(actions)/issue";
import {
  DEFAULT_ISSUE_SEARCH_QUERY,
  MAX_ITEMS_PER_PAGE
} from "~/lib/shared/constants";

// types
import type { EmojiSortKey } from "./issue-row";
import { getAuthedUser } from "~/app/(actions)/auth";

export type IssueListProps = {
  page?: string;
  searchQuery?: string;
};

export async function IssueList({ page, searchQuery }: IssueListProps) {
  const pageSchema = preprocess(
    (arg) => Number(arg),
    z.number().int().min(1).catch(1)
  );
  let currentPage = pageSchema.parse(page);

  const filters = parseIssueFilterTokens(
    searchQuery ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  const baseURL = searchQuery ? `q=${searchQuery ?? ""}&page=` : `page=`;

  const { issues, totalCount, noOfIssuesClosed, noOfIssuesOpen } =
    await getIssueList(filters, currentPage);

  let paginationCount = totalCount;
  if (filters.is) {
    paginationCount = filters.is === "open" ? noOfIssuesOpen : noOfIssuesClosed;
  }

  let emojiSort: EmojiSortKey | null = null;
  if (filters.sort?.startsWith("reactions-")) {
    emojiSort = filters.sort as EmojiSortKey;
  }
  const authedUser = await getAuthedUser();

  return (
    <>
      {/* Header on Mobile */}
      <div className="flex items-center gap-4 px-5  md:hidden md:px-0">
        <IssueSearchLink
          filters={{
            is: "open"
          }}
          className={clsx(
            "flex items-center gap-2",
            "transition duration-150",
            "focus:ring-2 ring-accent focus:outline-none rounded-md",
            {
              "font-semibold text-foreground": filters.is === "open",
              "text-grey": filters.is !== "open"
            }
          )}
          conserveCurrentFilters
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
          conserveCurrentFilters
          className={clsx(
            "flex items-center gap-2",
            "transition duration-150",
            "focus:ring-2 ring-accent focus:outline-none rounded-md",
            {
              "font-semibold text-foreground": filters.is === "closed",
              "text-grey": filters.is !== "closed"
            }
          )}
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
        {/* Issue content table - header on desktop */}
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
                  "flex items-center gap-2",
                  "transition duration-150",
                  "focus:ring-2 ring-accent focus:outline-none rounded-md",
                  {
                    "font-semibold text-foreground": filters.is === "open"
                  }
                )}
                filters={{
                  is: "open"
                }}
                conserveCurrentFilters
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
                conserveCurrentFilters
                className={clsx(
                  "flex items-center gap-2",
                  "transition duration-150",
                  "focus:ring-2 ring-accent focus:outline-none rounded-md",
                  {
                    "font-semibold text-foreground": filters.is === "closed"
                  }
                )}
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
                <button
                  className={clsx(
                    "flex items-center gap-2",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none rounded-md"
                  )}
                >
                  <span>Author</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueAuthorFilterActionList>
            </li>
            <li>
              <IssueLabelFilterActionList>
                <button
                  className={clsx(
                    "flex items-center gap-2",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none rounded-md"
                  )}
                >
                  <span>Label</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueLabelFilterActionList>
            </li>
            <li>
              <IssueAssigneeFilterActionList>
                <button
                  className={clsx(
                    "flex items-center gap-2",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none rounded-md"
                  )}
                >
                  <span>Assignee</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueAssigneeFilterActionList>
            </li>
            <li>
              <IssueSortActionList>
                <button
                  className={clsx(
                    "flex items-center gap-2",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none rounded-md"
                  )}
                >
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
              <li key={issue.number}>
                <IssueRow
                  {...issue}
                  emojiSort={emojiSort}
                  authedUserId={authedUser?.id}
                  authedUserAvatar={authedUser?.avatar_url}
                  authedUserUsername={authedUser?.username}
                />
              </li>
            ))}
          </ul>
        )}

        {/* END Issue content table - list */}
      </div>

      {totalCount > MAX_ITEMS_PER_PAGE && (
        <Pagination
          currentPage={currentPage}
          perPage={MAX_ITEMS_PER_PAGE}
          totalCount={paginationCount}
          baseURL={`/issues?${baseURL}`}
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
