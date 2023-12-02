"use client";
import * as React from "react";
// components
import { ReactAriaLink } from "~/app/(components)/react-aria-button";

// utils
import {
  formatSearchFiltersToString,
  parseIssueFilterTokens
} from "~/lib/shared/utils.shared";
import { useParams, useSearchParams } from "next/navigation";
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
  React.ElementRef<typeof ReactAriaLink>,
  IssueSearchLinkProps
>(function IssueSearchLink(
  { filters, conserveCurrentFilters = false, ...props },
  ref
) {
  const params = useParams() as {
    user: string;
    repository: string;
  };
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
  const href = `/${params.user}/${params.repository}/issues?` + sp.toString();

  return <ReactAriaLink {...props} ref={ref} href={href} />;
});
