"use client";
import * as React from "react";
// components
import Link from "next/link";

// utils
import { issueSearchFilterToString } from "~/lib/shared/utils.shared";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";

// types
import type { LinkProps } from "next/link";
import type { IssueSearchFilters } from "~/lib/shared/utils.shared";

export type IssueSearchLinkProps = Omit<LinkProps, "href" | "prefetch"> & {
  filters?: IssueSearchFilters;
  children?: React.ReactNode;
  className?: string;
};

export const IssueSearchLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  IssueSearchLinkProps
>(function IssueSearchLink({ filters, ...props }, ref) {
  const { setQuery: setSearchQuery } = useSearchQueryStore();

  const searchStr = issueSearchFilterToString({
    is: "open",
    ...filters
  });
  const href = `/issues?q=` + encodeURIComponent(searchStr);

  return (
    <Link
      {...props}
      ref={ref}
      href={href}
      prefetch={false}
      onClick={() => {
        setSearchQuery(searchStr);
      }}
    />
  );
});