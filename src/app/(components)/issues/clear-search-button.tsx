"use client";
import * as React from "react";
// components
import { XIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
import { BASE_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";

export function ClearSearchButtonSection() {
  const { setQuery: setSearchQuery, query } = useSearchQueryStore();

  return (
    <>
      {BASE_ISSUE_SEARCH_QUERY !== query.trim() && (
        <section className="px-5 md:px-0">
          <Link
            prefetch={false}
            href="/issues"
            onClick={() => setSearchQuery(BASE_ISSUE_SEARCH_QUERY)}
            className="group flex items-center gap-2 font-semibold text-grey hover:text-accent"
          >
            <div className="flex items-center justify-center rounded-md bg-grey p-1 group-hover:bg-accent">
              <XIcon className="h-4 w-4 text-white" />
            </div>
            <span>Clear current search query, filters, and sorts</span>
          </Link>
        </section>
      )}
    </>
  );
}
