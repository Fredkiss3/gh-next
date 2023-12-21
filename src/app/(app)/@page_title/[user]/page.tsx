import * as React from "react";
// components
import Link from "next/link";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { getUserByUsername } from "~/models/user";
import { notFound } from "next/navigation";

// types
import type { PageProps } from "~/lib/types";

export default async function UserPageTitle({
  params
}: PageProps<{
  user: string;
}>) {
  const user = await getUserByUsername(params.user);

  if (user === null) {
    notFound();
  }
  return (
    <Link
      href={`/${user.username}`}
      className={clsx(
        "md:text-lg",
        "font-medium text-grey",
        "md:font-normal md:text-foreground",
        "hover:bg-neutral/50",
        "rounded-md px-2 py-1 transition duration-150 text-base"
      )}
    >
      {user.username}
    </Link>
  );
}
