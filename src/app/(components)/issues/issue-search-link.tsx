"use client";
import * as React from "react";
// components
import Link from "next/link";

// utils
import {
  formatSearchFiltersToString,
  parseIssueFilterTokens
} from "~/lib/shared/utils.shared";
import { useSearchParams } from "next/navigation";
import { DEFAULT_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

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
  const searchParams = useSearchParams();
  const allFilters = parseIssueFilterTokens(
    searchParams.get("q") ?? DEFAULT_ISSUE_SEARCH_QUERY
  );

  let computedFilters: IssueSearchFilters = {
    is: "open"
  };

  if (conserveCurrentFilters) {
    computedFilters = { ...computedFilters, ...allFilters };
  }

  const searchStr = formatSearchFiltersToString({
    ...computedFilters,
    ...filters
  });

  const sp = new URLSearchParams();
  sp.append("q", searchStr);
  const href = `/issues?` + sp.toString();

  return <Link {...props} ref={ref} href={href} prefetch={false} />;
});
