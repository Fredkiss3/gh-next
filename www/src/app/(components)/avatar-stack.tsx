import * as React from "react";

// components
import { Avatar } from "./avatar";

// utils
import { clsx } from "~/lib/shared-utils";
import Link from "next/link";

// types
export type AvatarStackProps = {
  users: Array<{
    username: string;
    avatar_url: string;
  }>;
  className?: string;
  size?: "small" | "medium" | "large";
  getUserUrl?: (username: string) => string;
};

export function AvatarStack({
  users,
  className,
  size = "small",
  getUserUrl,
}: AvatarStackProps) {
  return (
    <ul className={clsx(className, "flex group gap-1")}>
      {users.map((u, index) => (
        <li
          key={u.username}
          className={clsx("transition-all duration-150", {
            "-mr-4 group-hover:mr-0": index !== users.length - 1,
          })}
        >
          {getUserUrl ? (
            // @ts-expect-error
            <Link href={getUserUrl(u.username)}>
              <Avatar
                src={u.avatar_url}
                username={u.username}
                size={size}
                className="border border-background"
              />
            </Link>
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
  );
}
