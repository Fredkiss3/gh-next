import * as React from "react";
import Link from "next/link";
import { clsx } from "~/lib/shared/utils.shared";

export default function SettingPageTitle() {
  return (
    <Link
      href="/notifications"
      className={clsx(
        "rounded-md px-2 py-1 transition duration-150 text-base",
        "md:text-lg",
        "hover:bg-neutral/50",
        "flex flex-wrap gap-2"
      )}
    >
      <strong className="whitespace-nowrap font-semibold">Notifications</strong>
    </Link>
  );
}
