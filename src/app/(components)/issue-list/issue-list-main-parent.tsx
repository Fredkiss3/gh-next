"use client";
import * as React from "react";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
import { BASE_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

export type IssueListMainParentProps = {
  initialQuery?: string;
  children: React.ReactNode;
};

export function IssueListMainParent({
  initialQuery,
  children
}: IssueListMainParentProps) {
  // we hack around useState, because useState will only called once
  // and that once is either in SSR or page navigation
  const [] = React.useState(() => {
    useSearchQueryStore.setState({
      query: initialQuery ?? BASE_ISSUE_SEARCH_QUERY
    });
  });

  return <>{children}</>;
}
