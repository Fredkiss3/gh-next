"use client";
import * as React from "react";
// components
import Link from "next/link";
import { Input } from "~/app/(components)/input";
import { ActionList } from "~/app/(components)/action-list";
import { Avatar } from "~/app/(components)/avatar";
import { CheckIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { filterIssueAuthorsByName } from "~/app/(actions)/issue";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";

// types
export type IssueAuthorFilterActionProps = {
  children: React.ReactNode;
};

export function IssueAuthorFilterActionList({
  children
}: IssueAuthorFilterActionProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);
  const [inputQuery, setInputQuery] = React.useState("");
  const [_, startTransition] = React.useTransition();
  const [filteredDataList, setFilteredDataList] = React.useState<
    Awaited<ReturnType<typeof filterIssueAuthorsByName>>
  >([]);

  React.useEffect(() => {
    filterIssueAuthorsByName("").then(setFilteredDataList);
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
        <Link
          prefetch={false}
          href={`/issues?q=is:open+author:${username}`}
          className={clsx(
            className,
            "flex items-center gap-4 hover:bg-neutral/50"
          )}
          onClick={onCloseList}
        >
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center px-2">
            {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
          </div>
          <Avatar src={avatar} username={username} size="small" />
          <div>
            <strong className="font-semibold">{username}</strong>&nbsp;
            <span className="text-grey">{name}</span>
          </div>
        </Link>
      )}
      align={alignRight ? "right" : "left"}
      title="Filter by author"
      header={
        <Input
          value={inputQuery}
          onChange={(e) => {
            setInputQuery(e.target.value);
            startTransition(async () => {
              await filterIssueAuthorsByName(e.target.value).then(
                setFilteredDataList
              );
            });
          }}
          label="Author name or username"
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
