"use client";
import * as React from "react";
// components
import { Input } from "~/components/input";
import { ActionList } from "~/components/action-list";
import { Avatar } from "~/components/avatar";
import { CheckIcon } from "@primer/octicons-react";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { clsx, parseIssueFilterTokens } from "~/lib/shared/utils.shared";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";
import { useIssueAuthorListByNameQuery } from "./use-issue-author-list-by-name-query";
import { useSearchParams } from "next/navigation";
import { DEFAULT_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

// types
export type IssueAuthorFilterActionProps = {
  children: React.ReactNode;
};

export function IssueAuthorFilterActionList({
  children
}: IssueAuthorFilterActionProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);
  const [inputQuery, setInputQuery] = React.useState("");

  const searchParams = useSearchParams();
  const allFilters = parseIssueFilterTokens(
    searchParams.get("q") ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  const currentAuthor = allFilters.author;
  const { data: filteredDataList } = useIssueAuthorListByNameQuery({
    name: inputQuery
  });

  return (
    <ActionList
      items={[
        {
          items: (filteredDataList ?? []).map((author) => ({
            ...author,
            selected: author.username === currentAuthor
          }))
        }
      ]}
      renderItem={({
        selected,
        className,
        username,
        name,
        avatar,
        onCloseList
      }) => {
        const newFilters = { ...allFilters };
        newFilters.author = username !== currentAuthor ? username : null;
        return (
          <IssueSearchLink
            filters={newFilters}
            className={clsx(
              className,
              "flex items-center gap-3 text-xs",
              "hover:bg-neutral/50"
            )}
            onClick={onCloseList}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
              {selected && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
            </div>
            <Avatar src={avatar} username={username} size="small" />
            <div>
              <strong className="font-semibold">{username}</strong>&nbsp;
              <span className="text-grey">{name}</span>
            </div>
          </IssueSearchLink>
        );
      }}
      align={alignRight ? "right" : "left"}
      title="Filter by author"
      header={
        <Input
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          label="Author name or username"
          hideLabel
          autoFocus
          placeholder="Filter users"
          className="min-w-[270px]"
        />
      }
    >
      {children}
    </ActionList>
  );
}
