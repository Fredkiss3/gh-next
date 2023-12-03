import * as React from "react";
// components
import { Avatar } from "../avatar";
import { LocationIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { clsx, getExcerpt } from "~/lib/shared/utils.shared";

// types
import type { PublicUser } from "~/app/(models)/dto/public-user-output-validator";
export type UserHoverCardContentsProps = {
  className?: string;
} & Omit<PublicUser, "id">;

export function UserHoverCardContents({
  name,
  username,
  bio,
  location,
  avatar_url,
  className
}: UserHoverCardContentsProps) {
  return (
    <div
      className={clsx(
        className,
        "flex w-[300px] max-w-[300px] flex-col gap-2 p-5"
      )}
    >
      <Avatar size="medium" src={avatar_url} username={username} />
      <Link href={`/${username}`} className="group/hovercard-link">
        <span className="text-lg font-semibold group-hover/hovercard-link:text-accent">
          {username}
        </span>
        {name && (
          <>
            &nbsp;
            <span className="text-grey group-hover/hovercard-link:text-accent">
              {name}
            </span>
          </>
        )}
      </Link>
      {bio && <p>{getExcerpt(bio, 88)}</p>}
      {location && (
        <div className="flex items-center gap-1 text-grey">
          <LocationIcon className="h-4 w-4" />
          <span>{location}</span>
        </div>
      )}
    </div>
  );
}
