"use client";
import * as React from "react";
// components
import { Input } from "../input";
import { ActionList } from "../action-list";
import { Avatar } from "../avatar";
import { CheckIcon } from "@primer/octicons-react";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { filterIssueAssignees } from "~/app/(actions)/issue";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";

// types
export type IssueAssigneeFilterActionProps = {
  children: React.ReactNode;
};

export function IssueAssigneeFilterActionList({
  children
}: IssueAssigneeFilterActionProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);
  const [inputQuery, setInputQuery] = React.useState("");
  const [_, startTransition] = React.useTransition();
  const [filteredDataList, setFilteredDataList] = React.useState<
    Awaited<Awaited<ReturnType<typeof filterIssueAssignees>>["promise"]>
  >([]);

  React.useEffect(() => {
    filterIssueAssignees("")
      .then((r) => r.promise)
      .then(setFilteredDataList);
  }, []);

  return (
    <ActionList
      items={[
        {
          items: filteredDataList
        }
      ]}
      renderItem={({
        selected,
        className,
        username,
        name,
        avatar,
        onCloseList
      }) => (
        <IssueSearchLink
          filters={
            username
              ? {
                  assignee: [username]
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
      )}
      align={alignRight ? "right" : "left"}
      title="Filter by who’s assigned"
      header={
        <Input
          value={inputQuery}
          onChange={(e) => {
            setInputQuery(e.target.value);
            startTransition(async () => {
              await filterIssueAssignees(e.target.value)
                .then((r) => r.promise)
                .then(setFilteredDataList);
            });
          }}
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
