"use client";
import * as React from "react";
// components
import {
  ActionList,
  type ActionListGroup
} from "~/app/(components)/action-list";
import { CheckIcon } from "@primer/octicons-react";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
export type IssueSortActionListProps = {
  children: React.ReactNode;
};

const sortItems: ActionListGroup<{
  emoji?: boolean;
  text: string;
  id: IssueSearchFilters["sort"];
}>[] = [
  {
    items: [
      { text: "Newest", id: "created-desc" },
      { text: "Oldest", id: "created-asc" },
      { text: "Most commented", id: "comments-asc" },
      { text: "Least commented", id: "comments-desc" },
      { text: "Recently updated", id: "updated-desc" },
      { text: "Least recently updated", id: "updated-asc" },
      { text: "Best match", id: "relevance-desc" }
    ]
  },
  {
    header: {
      title: "Most reactions"
    },
    horizontal: true,
    items: [
      { emoji: true, text: "👍", id: "reactions-+1-desc" },
      { emoji: true, text: "👎", id: "reactions--1-desc" },
      { emoji: true, text: "😄", id: "reactions-smile-desc" },
      { emoji: true, text: "🎉", id: "reactions-tada-desc" },
      { emoji: true, text: "😕", id: "reactions-thinking_face-desc" },
      { emoji: true, text: "❤️", id: "reactions-heart-desc" },
      { emoji: true, text: "🚀", id: "reactions-rocket-desc" },
      { emoji: true, text: "👀", id: "reactions-eyes-desc" }
    ]
  }
];

export function IssueSortActionList({ children }: IssueSortActionListProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);

  const getParsedQuery = useSearchQueryStore((store) => store.getParsedQuery);
  let allFilters = getParsedQuery();
  const sortFilter = allFilters.sort;

  return (
    <ActionList
      items={sortItems}
      renderItem={({ className, text, id, onCloseList, emoji }) => {
        const newFilters = { ...allFilters };
        const selected = id === (sortFilter ?? "created-desc"); // Select "created-desc" (Newest) by default

        newFilters.sort = selected ? null : id;
        return (
          <IssueSearchLink
            filters={newFilters}
            className={clsx(className, "flex items-center gap-4", {
              "hover:bg-neutral/50": !emoji,
              "justify-center rounded-md p-2 hover:bg-accent border border-transparent":
                emoji,
              "!border-accent bg-accent/10 hover:!bg-accent/10":
                emoji && selected
            })}
            onClick={onCloseList}
          >
            {!emoji ? (
              <>
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
                  {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
                </div>
                <span>{text}</span>
              </>
            ) : (
              <div>{text}</div>
            )}
          </IssueSearchLink>
        );
      }}
      align={alignRight ? "right" : "left"}
      title="Sort by"
    >
      {children}
    </ActionList>
  );
}
