"use client";

import * as React from "react";
import Link from "next/link";
import { clsx } from "~/lib/shared/utils.shared";
import { usePathname } from "next/navigation";

export function PageTitle() {
  const path = usePathname();

  let title: React.ReactNode = React.useMemo(
    () => (
      <>
        <span
          className={clsx(
            "font-medium text-grey",
            "md:font-normal md:text-foreground"
          )}
        >
          Fredkiss3&nbsp;&nbsp;/
        </span>

        <strong className="whitespace-nowrap font-semibold">gh-next</strong>
      </>
    ),
    []
  );
  let href = "/";

  if (path.startsWith("/settings")) {
    title = (
      <strong className="whitespace-nowrap font-semibold">Settings</strong>
    );
    href = "/settings";
  } else if (path.startsWith("/notifications")) {
    title = (
      <strong className="whitespace-nowrap font-semibold">Notifications</strong>
    );
    href = "/notifications";
  }

  return (
    <Link
      href={href}
      className={clsx(
        "rounded-md px-2 py-1 transition duration-150 text-base",
        "md:text-lg",
        "hover:bg-neutral/50",
        "flex flex-wrap gap-2"
      )}
    >
      {title}
    </Link>
  );
}
