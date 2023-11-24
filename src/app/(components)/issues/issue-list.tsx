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
import { getRepositoryByOwnerAndName } from "~/app/(models)/repository";

export type IssueListProps = {
  page?: string;
  searchQuery?: string;
  user: string;
  repository: string;
};

export async function IssueList({
  page,
  searchQuery,
  user,
  repository: repository_name
}: IssueListProps) {
  const pageSchema = preprocess(
    (arg) => Number(arg),
    z.number().int().min(1).catch(1)
  );
  let currentPage = pageSchema.parse(page);

  const filters = parseIssueFilterTokens(
    searchQuery ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  const baseURL = searchQuery ? `q=${searchQuery ?? ""}&page=` : `page=`;

  const [{ issues, totalCount, noOfIssuesClosed, noOfIssuesOpen }, repository] =
    await Promise.all([
      getIssueList(filters, currentPage),
      getRepositoryByOwnerAndName(user, repository_name)
    ]);

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
      <div className="flex items-center gap-4 px-5 text-sm md:hidden md:px-0">
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
          <IssueOpenedIcon className="h-4 w-4" />
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
          <CheckIcon className="h-4 w-4" />
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
            "border-b border-neutral bg-subtle p-4 text-grey"
          )}
        >
          <ul className="hidden items-center gap-4 md:flex">
            <li>
              <IssueSearchLink
                className={clsx(
                  "flex items-center gap-2 rounded-md text-sm",
                  "transition duration-150",
                  "focus:ring-2 ring-accent focus:outline-none",
                  {
                    "font-semibold text-foreground": filters.is === "open"
                  }
                )}
                filters={{
                  is: "open"
                }}
                conserveCurrentFilters
              >
                <IssueOpenedIcon className="h-4 w-4" />
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
                  "flex items-center gap-2 rounded-md text-sm",
                  "transition duration-150",
                  "focus:ring-2 ring-accent focus:outline-none",
                  {
                    "font-semibold text-foreground": filters.is === "closed"
                  }
                )}
              >
                <CheckIcon className="h-4 w-4" />
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
                    "flex items-center gap-2 text-sm rounded-md",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none"
                  )}
                >
                  <span>Author</span> <TriangleDownIcon className="h-4 w-4" />
                </button>
              </IssueAuthorFilterActionList>
            </li>
            <li>
              <IssueLabelFilterActionList>
                <button
                  className={clsx(
                    "flex items-center gap-2 text-sm rounded-md",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none"
                  )}
                >
                  <span>Label</span> <TriangleDownIcon className="h-4 w-4" />
                </button>
              </IssueLabelFilterActionList>
            </li>
            <li>
              <IssueAssigneeFilterActionList>
                <button
                  className={clsx(
                    "flex items-center gap-2 text-sm rounded-md",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none"
                  )}
                >
                  <span>Assignee</span> <TriangleDownIcon className="h-4 w-4" />
                </button>
              </IssueAssigneeFilterActionList>
            </li>
            <li>
              <IssueSortActionList>
                <button
                  className={clsx(
                    "flex items-center gap-2 text-sm rounded-md",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none"
                  )}
                >
                  <span>Sort</span> <TriangleDownIcon className="h-4 w-4" />
                </button>
              </IssueSortActionList>
            </li>
          </ul>
        </div>
        {/* END Issue content table - header */}

        {/* Issue content table - list */}
        {issues.length === 0 ? (
          <EmptyState
            user={repository!.owner.username}
            repository={repository!.name}
          />
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

function EmptyState(props: { user: string; repository: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-12 py-24">
      <IssueOpenedIcon className="h-6 w-6 text-grey" />

      <h3 className="text-2xl font-semibold">Nothing to see here!</h3>

      <p className="text-center text-lg text-grey">
        Either no issue matched your search or there is not issue yet in the
        database. <br /> You can still &nbsp;
        <Link
          href={`/${props.user}/${props.repository}/issues/new`}
          className="text-accent"
        >
          create a new issue
        </Link>
        .
      </p>
    </div>
  );
}
