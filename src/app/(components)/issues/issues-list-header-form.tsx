"use client";
import * as React from "react";

// components
import { ActionList } from "~/app/(components)/action-list";
import { Button } from "~/app/(components)/button";
import {
  CheckIcon,
  LinkExternalIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import { IssueListSearchInput } from "./issue-list-search-input";

// utils
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clsx, parseIssueFilterTokens } from "~/lib/shared/utils.shared";
import { IssueSearchLink } from "./issue-search-link";
import { DEFAULT_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

// types
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";
export type IssuesListHeaderFormProps = {
  className?: string;
  showActionList?: boolean;
};

export function IssuesListHeaderForm({
  className,
  showActionList
}: IssuesListHeaderFormProps) {
  const formRef = React.useRef<React.ElementRef<"form">>(null);
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");

  const filters = parseIssueFilterTokens(
    searchQuery ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  const onSearch = React.useCallback(
    () => formRef.current?.requestSubmit(),
    []
  );
  return (
    <>
      <form
        ref={formRef}
        method="get"
        onSubmit={(e) => {
          e.preventDefault();

          const searchParams = new URLSearchParams(
            // @ts-expect-error the URLSearchParams constructor supports formData
            new FormData(e.currentTarget)
          );
          router.push(path + "?" + searchParams.toString());
        }}
        className={clsx(className, "flex w-full items-center min-w-0")}
      >
        {showActionList && (
          <ActionList<{
            text: string;
            filters: IssueSearchFilters;
          }>
            items={[
              {
                items: [
                  {
                    filters: {
                      is: "open"
                    },
                    text: "Open issues",
                    selected:
                      searchQuery === null ||
                      searchQuery.trim() === DEFAULT_ISSUE_SEARCH_QUERY
                  },
                  {
                    filters: {
                      is: "open",
                      author: "@me"
                    },
                    text: "Your issues",
                    selected:
                      filters.author === "@me" || filters.author === "me"
                  },
                  {
                    filters: {
                      is: "open",
                      assignee: ["@me"]
                    },
                    text: "Issues assigned to you",
                    selected:
                      !!filters.assignee &&
                      filters.assignee.length > 0 &&
                      (filters.assignee.includes("me") ||
                        filters.assignee.includes("@me"))
                  },
                  {
                    filters: {
                      is: "open",
                      mentions: "@me"
                    },
                    text: "Issues mentionning you",
                    selected:
                      filters.mentions === "@me" || filters.mentions === "me"
                  }
                ]
              }
            ]}
            renderItem={({
              text,
              onCloseList,
              filters,
              className,
              selected
            }) => (
              <IssueSearchLink
                filters={filters}
                onClick={onCloseList}
                className={clsx(
                  className,
                  "flex items-center gap-2 hover:bg-neutral/50 text-xs"
                )}
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
                  {selected && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
                </div>
                <span>{text}</span>
              </IssueSearchLink>
            )}
            align="left"
            title="Filter issues"
            footer={
              <a
                href="https://docs.github.com/articles/searching-issues"
                target="_blank"
                className="flex items-center gap-2 text-xs"
              >
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
                  <LinkExternalIcon className="h-4 w-4 flex-shrink-0" />
                </div>
                <strong className="font-medium">
                  View advanced search syntax
                </strong>
              </a>
            }
          >
            <Button
              type="button"
              variant="subtle"
              className="rounded-r-none border-r-0 flex-shrink-0"
              renderTrailingIcon={(cls) => <TriangleDownIcon className={cls} />}
            >
              Filters
            </Button>
          </ActionList>
        )}
        <IssueListSearchInput
          key={searchQuery}
          searchQuery={searchQuery}
          squaredInputBorder={showActionList}
          onSearch={onSearch}
        />
      </form>
    </>
  );
}
