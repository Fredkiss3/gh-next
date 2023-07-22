"use client";
import * as React from "react";

// components
import Link from "next/link";

// utils
import { useActiveLink } from "~/lib/hooks/use-active-link";
import { clsx } from "~/lib/functions";

// types
import type { LinkProps } from "next/link";
import type { Route } from "next";

type NavLinkProps = LinkProps<Route> & {
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
      className={clsx("py-3 group relative", {
        "font-medium after:absolute after:left-0 after:right-0 after:-bottom-0.5":
          isActive,
        "after:bg-severe-border after:rounded-md after:h-1": isActive,
      })}
      href={href}
    >
      <div
        className={clsx(
          "inline-flex gap-3 items-center rounded-md py-1 px-1.5",
          "group-hover:bg-neutral/50 transition duration-150"
        )}
      >
        <Icon className="h-4 w-4 text-grey" />
        {children}
      </div>
    </Link>
  );
}
