"use client";
import * as React from "react";

// components
import Link from "next/link";

// utils
import { useActiveLink } from "~/lib/client/hooks/use-active-link";
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { LinkProps } from "next/link";

type VerticalNavLinkProps = LinkProps & {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
};

export function VerticalNavLink({
  href,
  children,
  icon: Icon,
  ...props
}: VerticalNavLinkProps) {
  const isActive = useActiveLink(href.toString());

  return (
    <Link
      {...props}
      aria-current={isActive && "page"}
      className={clsx("py-3 group relative w-full", {
        "font-medium before:absolute before:-left-1.5": isActive,
        "before:bg-accent before:rounded-md before:w-1 before:h-[calc(100%-16px)]":
          isActive,
        "before:top-1/2 before:translate-y-[-55%]": isActive,
      })}
      href={href}
    >
      <div
        className={clsx(
          "inline-flex gap-2 items-center rounded-md py-1 px-1.5 w-full",
          "group-hover:bg-neutral/50 transition duration-150",
          {
            "bg-neutral/40": isActive,
          }
        )}
      >
        <Icon className="h-4 w-4 text-grey" />
        {children}
      </div>
    </Link>
  );
}
