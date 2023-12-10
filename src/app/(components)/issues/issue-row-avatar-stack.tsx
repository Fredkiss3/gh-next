import * as React from "react";

// components
import { Avatar } from "~/app/(components)/avatar";
import { Tooltip } from "~/app/(components)/tooltip";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { IssueSearchLink } from "./issue-search-link";

// types
export type IssueRowAvatarStackProps = {
  users: Array<{
    username: string;
    avatar_url: string;
  }>;
  className?: string;
  size?: "small" | "medium" | "large";
};

export function IssueRowAvatarStack({
  users,
  className,
  size = "small"
}: IssueRowAvatarStackProps) {
  return (
    <Tooltip
      content={
        <span className="text-sm">
          assigned to {users.map((u) => u.username).join(" and ")}
        </span>
      }
      delayInMs={500}
      closeDelayInMs={500}
      placement="bottom end"
    >
      <ul className={clsx(className, "group flex gap-1")}>
        {users.map((u, index) => (
          <li
            key={u.username}
            className={clsx("transition-all duration-150", {
              "-mr-4 group-hover:mr-0": index !== users.length - 1
            })}
          >
            <IssueSearchLink
              filters={{
                is: "open",
                assignee: [u.username]
              }}
            >
              <Avatar
                src={u.avatar_url}
                username={u.username}
                size={size}
                className="border border-background"
              />
            </IssueSearchLink>
          </li>
        ))}
      </ul>
    </Tooltip>
  );
}
