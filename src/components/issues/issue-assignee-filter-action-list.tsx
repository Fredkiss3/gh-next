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
import { useIssueAssigneeListQuery } from "./use-issue-assignee-list-query";
import { useSearchParams } from "next/navigation";
import { DEFAULT_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

// types
export type IssueAssigneeFilterActionProps = {
  children: React.ReactNode;
};

export function IssueAssigneeFilterActionList({
  children
}: IssueAssigneeFilterActionProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);
  const [inputQuery, setInputQuery] = React.useState("");

  const searchParams = useSearchParams();
  const allFilters = parseIssueFilterTokens(
    searchParams.get("q") ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  const currentAssignees = allFilters.assignee ?? [];
  const noAssignee = !!allFilters.no?.includes("assignee");

  const { data: filteredDataList } = useIssueAssigneeListQuery({
    name: inputQuery,
    enabled: true,
    checkFullName: true
  });

  const assigneeList = React.useMemo(() => {
    return [
      {
        name: "nobody",
        username: null,
        avatar: null,
        selected: noAssignee
      },
      ...(filteredDataList ?? []).map((assignee) => {
        return {
          ...assignee,
          selected: allFilters.assignee?.includes(assignee.username)
        };
      })
    ];
  }, [noAssignee, allFilters.assignee, filteredDataList]);

  return (
    <ActionList
      items={[
        {
          items: assigneeList
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
        let newFilters = { ...allFilters };

        if (!username && !selected) {
          if (newFilters.no) {
            newFilters.no = [...newFilters.no, "assignee"];
          } else {
            newFilters.no = ["assignee"];
          }

          newFilters.assignee = null;
        } else {
          newFilters.no = (newFilters.no ?? [])?.filter(
            (item) => item !== "assignee"
          ); // don't keep the 'no:assignee' filter

          if (username) {
            // remove the filters
            if (currentAssignees.includes(username)) {
              newFilters = {
                ...newFilters,
                assignee: currentAssignees.filter(
                  (assignee) => assignee !== username
                )
              };
            } else {
              newFilters = {
                ...newFilters,
                assignee: [...currentAssignees, username]
              };
            }
          }
        }

        return (
          <IssueSearchLink
            filters={newFilters}
            className={clsx(
              className,
              "flex items-center gap-4 text-xs",
              "hover:bg-neutral/50"
            )}
            onClick={onCloseList}
          >
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
              {selected && <CheckIcon className="h-4 w-4 flex-shrink-0" />}
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
          name=""
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
