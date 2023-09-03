"use client";

import * as React from "react";

// components
import { NavLink } from "./nav-link";
import {
  CodeIcon,
  CommentDiscussionIcon,
  GitPullRequestIcon,
  GraphIcon,
  IssueOpenedIcon,
  PlayIcon,
  ShieldIcon,
} from "@primer/octicons-react";
import { CounterBadge } from "./counter-badge";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { usePathname } from "next/navigation";

// types
export type UnderlineNavbarProps = {
  className?: string;
  noOfOpennedIssues?: number;
};

export function HeaderUnderlineNavbar({
  className,
  noOfOpennedIssues = 0,
}: UnderlineNavbarProps) {
  const path = usePathname();

  let hideNavbar =
    path.startsWith("/settings") || path.startsWith("/notifications");

  return (
    !hideNavbar && (
      <nav
        className={clsx(
          "border-b border-neutral",
          "px-5 relative z-20 overflow-x-auto overflow-y-clip",
          "md:px-8",
          "h-[52px]",
          className
        )}
      >
        <ul
          className={clsx(
            "flex items-end gap-4 justify-start min-w-max pr-5",
            "md:pr-0"
          )}
        >
          <li className="inline-flex">
            <NavLink href="/" icon={CodeIcon}>
              Code
            </NavLink>
          </li>
          <li className="inline-flex">
            <NavLink href="/issues" icon={IssueOpenedIcon}>
              <span>Issues</span>
              {noOfOpennedIssues > 0 && (
                <CounterBadge count={noOfOpennedIssues} />
              )}
            </NavLink>
          </li>
          <li className="inline-flex">
            <NavLink href="/pulls" icon={GitPullRequestIcon}>
              Pull Requests
            </NavLink>
          </li>
          <li className="inline-flex">
            <NavLink href="/discussions" icon={CommentDiscussionIcon}>
              Discussions
            </NavLink>
          </li>
          <li className="inline-flex">
            <NavLink href="/actions" icon={PlayIcon}>
              Actions
            </NavLink>
          </li>
          <li className="inline-flex">
            <NavLink href="/security" icon={ShieldIcon}>
              Security
            </NavLink>
          </li>
          <li className="inline-flex">
            <NavLink href="/pulse" icon={GraphIcon}>
              Insights
            </NavLink>
          </li>
        </ul>
      </nav>
    )
  );
}
