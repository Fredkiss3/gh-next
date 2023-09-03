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
            "md:text-foreground md:font-normal"
          )}
        >
          Fredkiss3&nbsp;&nbsp;/
        </span>

        <strong className="font-semibold whitespace-nowrap">gh-next</strong>
      </>
    ),
    []
  );
  let href = "/";

  if (path.startsWith("/settings")) {
    title = (
      <strong className="font-semibold whitespace-nowrap">Settings</strong>
    );
    href = "/settings";
  } else if (path.startsWith("/notifications")) {
    title = (
      <strong className="font-semibold whitespace-nowrap">Notifications</strong>
    );
    href = "/notifications";
  }

  return (
    <Link
      href={href}
      className={clsx(
        "py-1 px-2 rounded-md transition duration-150",
        "md:text-lg",
        "hover:bg-neutral/50",
        "flex flex-wrap gap-2"
      )}
    >
      {title}
    </Link>
  );
}
