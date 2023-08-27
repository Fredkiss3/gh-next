"use client";
import * as React from "react";
// components
import Link from "next/link";
import { Input } from "./input";
import { ActionList } from "./action-list";
import { Avatar } from "./avatar";
import { CheckIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared-utils";
import { filterIssueAuthors } from "~/app/(actions)/issue";
import { useMediaQuery } from "~/lib/hooks/use-media-query";

// types
export type IssueAuthorFilterActionProps = {
  children: React.ReactNode;
};

export function IssueAuthorFilterActionList({
  children,
}: IssueAuthorFilterActionProps) {
  const alignRight = useMediaQuery(`(min-width: 768px)`);
  const [inputQuery, setInputQuery] = React.useState("");
  const [_, startTransition] = React.useTransition();
  const [filteredDataList, setFilteredDataList] = React.useState<
    Awaited<ReturnType<typeof filterIssueAuthors>>
  >([]);

  React.useEffect(() => {
    filterIssueAuthors("").then(setFilteredDataList);
  }, []);

  return (
    <ActionList
      items={[
        {
          items: filteredDataList,
        },
      ]}
      renderItem={({
        selected,
        className,
        username,
        name,
        avatar,
        onCloseList,
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
          <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
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
              await filterIssueAuthors(e.target.value).then(
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
