"use client";
import * as React from "react";

// components
import Link from "next/link";

// utils
import { useActiveLink } from "~/lib/client/hooks/use-active-link";
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { LinkProps } from "next/link";

type NavLinkProps = LinkProps & {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
};

export function NavLink({
  href,
  children,
  icon: Icon,
  ...props
}: NavLinkProps) {
  const isActive = useActiveLink(href.toString());

  return (
    <Link
      {...props}
      className={clsx("group relative py-3", "focus:outline-none", {
        "font-medium after:absolute after:-bottom-0.5 after:left-0 after:right-0":
          isActive,
        "after:z-20 after:h-1 after:rounded-md after:bg-severe-border": isActive
      })}
      href={href}
    >
      <div
        className={clsx(
          "inline-flex items-center gap-3 rounded-md px-1.5 py-1",
          "transition duration-150",
          "group-hover:bg-neutral/50 group-focus:ring-2 ring-accent"
        )}
      >
        <Icon className="h-4 w-4 text-grey" />
        {children}
      </div>
    </Link>
  );
}
