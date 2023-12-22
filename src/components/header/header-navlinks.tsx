import "server-only";
import * as React from "react";

// components
import { NavLink } from "~/components/nav-link";
import { CodeIcon, IssueOpenedIcon, PlayIcon } from "@primer/octicons-react";
import { CounterBadge } from "~/components/counter-badge";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { getOpenIssuesCount } from "~/models/issues";

// types
export type UnderlineNavbarProps = {
  className?: string;
  params: {
    user: string;
    repository: string;
  };
};

export async function HeaderNavLinks({
  className,
  params
}: UnderlineNavbarProps) {
  const noOfOpennedIssues = await getOpenIssuesCount();
  return (
    <nav
      className={clsx(
        "relative z-20 overflow-x-auto overflow-y-clip px-5 hide-scrollbars",
        "md:px-8",
        "h-[52px]",
        className
      )}
    >
      <ul
        className={clsx(
          "flex min-w-max items-end justify-start gap-4 pr-5",
          "md:pr-0"
        )}
      >
        <li className="inline-flex">
          <NavLink
            href={`/${params.user}/${params.repository}/`}
            isRootLink
            icon={<CodeIcon className="h-4 w-4 text-grey" />}
          >
            Code
          </NavLink>
        </li>
        <li className="inline-flex">
          <NavLink
            href={`/${params.user}/${params.repository}/issues`}
            icon={<IssueOpenedIcon className="h-4 w-4 text-grey" />}
          >
            <span>Issues</span>
            {noOfOpennedIssues > 0 && (
              <CounterBadge count={noOfOpennedIssues} />
            )}
          </NavLink>
        </li>
        <li className="inline-flex">
          <NavLink
            href={`/${params.user}/${params.repository}/actions`}
            icon={<PlayIcon className="h-4 w-4 text-grey" />}
          >
            Actions
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
