"use client";
import * as React from "react";
// components
import { XIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
import { BASE_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

export function ClearSearchButton() {
  const { setQuery: setSearchQuery, query } = useSearchQueryStore();

  return (
    <>
      {BASE_ISSUE_SEARCH_QUERY !== query.trim() && (
        <Link
          prefetch={false}
          href="/issues"
          onClick={() => setSearchQuery(BASE_ISSUE_SEARCH_QUERY)}
          className="flex gap-2 items-center text-grey font-semibold group hover:text-accent"
        >
          <div className="bg-grey rounded-md p-1 flex items-center justify-center group-hover:bg-accent">
            <XIcon className="text-white h-4 w-4" />
          </div>
          <span>Clear current search query, filters, and sorts</span>
        </Link>
      )}
    </>
  );
}
