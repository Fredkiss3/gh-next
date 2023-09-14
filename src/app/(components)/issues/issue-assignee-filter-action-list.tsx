"use client";
import * as React from "react";
// components
import { Input } from "~/app/(components)/input";
import { ActionList } from "~/app/(components)/action-list";
import { Avatar } from "~/app/(components)/avatar";
import { CheckIcon } from "@primer/octicons-react";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
import { useIssueAssigneeListQuery } from "~/lib/client/hooks/use-issue-assignee-list-query";

// types
export type IssueAssigneeFilterActionProps = {
  children: React.ReactNode;
};

export function IssueAssigneeFilterActionList({
  children
}: IssueAssigneeFilterActionProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);
  const [inputQuery, setInputQuery] = React.useState("");

  const getParsedQuery = useSearchQueryStore((store) => store.getParsedQuery);
  const currentAssignees = getParsedQuery().assignee ?? [];
  const { data: filteredDataList } = useIssueAssigneeListQuery({
    name: inputQuery,
    enabled: true,
    checkFullName: true
  });

  return (
    <ActionList
      items={[
        {
          items: (filteredDataList ?? []).map((assignee) => ({
            ...assignee,
            selected: currentAssignees?.includes(assignee.username)
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
        let assigneeFilters: string[] = [];

        if (name) {
          if (currentAssignees.includes(username)) {
            assigneeFilters = currentAssignees.filter(
              (assignee) => assignee !== username
            );
          } else {
            assigneeFilters = [...currentAssignees, username];
          }
        }
        return (
          <IssueSearchLink
            filters={
              username
                ? {
                    assignee: assigneeFilters
                  }
                : {
                    no: new Set(["assignee"])
                  }
            }
            className={clsx(
              className,
              "flex items-center gap-4 hover:bg-neutral/50"
            )}
            onClick={onCloseList}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
              {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
            </div>
            {username && avatar && (
              <Avatar src={avatar} username={username} size="small" />
            )}
            <div>
              {!username ? (
                <strong className="font-semibold">Assigned to nobody</strong>
              ) : (
                <>
                  <strong className="font-semibold">{username}</strong>&nbsp;
                  <span className="text-grey">{name}</span>
                </>
              )}
            </div>
          </IssueSearchLink>
        );
      }}
      align={alignRight ? "right" : "left"}
      title="Filter by who’s assigned"
      header={
        <Input
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          label="name or username"
          hideLabel
          autoFocus
          placeholder="Filter users"
        />
      }
    >
      {children}
    </ActionList>
  );
}
