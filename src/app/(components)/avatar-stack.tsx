import * as React from "react";

// components
import { Avatar } from "./avatar";
import Link from "next/link";
import { Tooltip } from "./tooltip";
import { ReactAriaLink } from "./react-aria-button";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
export type AvatarStackProps = {
  users: Array<{
    username: string;
    avatar_url: string;
  }>;
  className?: string;
  size?: "small" | "medium" | "large";
  getUserUrl?: (username: string) => string;
  tooltipLabel: string;
};

export function AvatarStack({
  users,
  className,
  size = "small",
  getUserUrl,
  tooltipLabel
}: AvatarStackProps) {
  return (
    <Tooltip
      content={<span className="text-sm">{tooltipLabel}</span>}
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
            {getUserUrl ? (
              <ReactAriaLink>
                <Link prefetch={false} href={getUserUrl(u.username)}>
                  <Avatar
                    src={u.avatar_url}
                    username={u.username}
                    size={size}
                    className="border border-background"
                  />
                </Link>
              </ReactAriaLink>
            ) : (
              <Avatar
                src={u.avatar_url}
                username={u.username}
                size={size}
                className="border border-background"
              />
            )}
          </li>
        ))}
      </ul>
    </Tooltip>
  );
}
