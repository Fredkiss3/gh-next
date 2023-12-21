"use client";
import * as React from "react";
// components
import { XIcon } from "@primer/octicons-react";
import Link from "next/link";

// utils
import { DEFAULT_ISSUE_SEARCH_QUERY } from "~/lib/shared/constants";
import { useParams, useSearchParams } from "next/navigation";

export function ClearSearchButtonSection() {
  const searchParams = useSearchParams();
  const params = useParams() as {
    user: string;
    repository: string;
  };
  const searchQuery = searchParams.get("q");

  return (
    <>
      {searchQuery !== null &&
        DEFAULT_ISSUE_SEARCH_QUERY !== searchQuery.trim() && (
          <section className="px-5 md:px-0">
            <Link
              prefetch={false}
              href={`/${params.user}/${params.repository}/issues`}
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
