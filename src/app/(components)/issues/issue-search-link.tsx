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
  filters: IssueSearchFilters;
  children?: React.ReactNode;
  className?: string;
  conserveCurrentFilters?: boolean;
};

export const IssueSearchLink = React.forwardRef<
  React.ElementRef<typeof Link>,
  IssueSearchLinkProps
>(function IssueSearchLink(
  { filters, conserveCurrentFilters = false, ...props },
  ref
) {
  const setSearchQuery = useSearchQueryStore((store) => store.setQuery);
  const getParsedQuery = useSearchQueryStore((store) => store.getParsedQuery);
  const allFilters = getParsedQuery();

  let computedFilters: IssueSearchFilters = {
    is: "open"
  };

  if (conserveCurrentFilters) {
    computedFilters = { ...computedFilters, ...allFilters };
  }

  const searchStr = issueSearchFilterToString({
    ...computedFilters,
    ...filters
  });

  const sp = new URLSearchParams();
  sp.append("q", searchStr);
  const href = `/issues?` + sp.toString();

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
