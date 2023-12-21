import * as React from "react";
// components
import Link from "next/link";
import { HoverCard } from "~/app/(components)/hovercard/hovercard";
import { UserHoverCardContents } from "~/app/(components)/hovercard/user-hovercard-contents";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { getRepositoryByOwnerAndName } from "~/app/(models)/repository";
import { notFound } from "next/navigation";

// types
import type { PageProps } from "~/lib/types";

export async function RepositoryPageTitle({
  params
}: PageProps<{
  user: string;
  repository: string;
}>) {
  const repository = await getRepositoryByOwnerAndName(
    params.user,
    params.repository
  );

  if (repository === null) {
    notFound();
  }

  return (
    <div className={clsx("md:text-lg", "flex flex-wrap items-center")}>
      <HoverCard
        side="bottom"
        align="start"
        delayInMs={700}
        content={
          <UserHoverCardContents
            avatar_url={repository.owner.avatar_url}
            name={repository.owner.name}
            bio={repository.owner.bio}
            username={repository.owner.username}
            location={repository.owner.location}
          />
        }
      >
        <Link
          href={`/${repository.owner.username}`}
          className={clsx(
            "font-medium text-grey",
            "md:font-normal md:text-foreground",
            "hover:bg-neutral/50",
            "rounded-md px-2 py-1 transition duration-150 text-sm"
          )}
        >
          {repository.owner.username}
        </Link>
      </HoverCard>
      <span className="text-grey">/</span>
      <Link
        href={`/${repository.owner.username}/${repository.name}`}
        className={clsx(
          "hover:bg-neutral/50",
          "rounded-md px-2 py-1 transition duration-150 text-sm"
        )}
      >
        <strong className="whitespace-nowrap font-semibold">
          {repository.name}
        </strong>
      </Link>
    </div>
  );
}

export default RepositoryPageTitle;
