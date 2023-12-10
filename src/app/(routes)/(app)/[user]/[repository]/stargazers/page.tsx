import * as React from "react";
// components
import {
  ClockIcon,
  LocationIcon,
  OrganizationIcon
} from "@primer/octicons-react";
import { Avatar } from "~/app/(components)/avatar";
import { Pagination } from "~/app/(components)/pagination";
import { Skeleton } from "~/app/(components)/skeleton";

// utils
import { getGithubRepoData } from "~/app/(actions)/github.action";
import { formatDate, range, reversePaginate } from "~/lib/shared/utils.shared";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";
export const metadata: Metadata = {
  title: "Stargazers"
};

export default function StargazersPage({
  searchParams
}: PageProps<{}, { page?: string }>) {
  let currentPage = Number(searchParams?.page);

  if (isNaN(currentPage) || currentPage < 0) {
    currentPage = 1;
  }

  return (
    <React.Suspense fallback={<StargazersPageSkeleton />} key={currentPage}>
      <StargazersPageContent currentPage={currentPage} />
    </React.Suspense>
  );
}

async function StargazersPageContent({ currentPage }: { currentPage: number }) {
  const repo = await getGithubRepoData();

  const MAX_NO_OF_STARGAZERS_PER_PAGE = 45;

  const paginatedStargazers = reversePaginate(
    repo.stargazers,
    currentPage,
    MAX_NO_OF_STARGAZERS_PER_PAGE
  );

  return (
    <section className="px-5 flex flex-col gap-4">
      <h1 className="text-2xl border-b border-neutral pb-4">Stargazers</h1>

      <ol className="grid gap-4 md:grid-cols-3">
        {paginatedStargazers.map((stargazer) => (
          <li
            key={stargazer.id}
            className="flex gap-4 items-start border-b border-neutral py-4"
          >
            <Avatar
              size="medium"
              src={stargazer.avatarUrl}
              username={stargazer.login}
              className="h-12 w-12"
            />
            <div className="flex flex-col gap-3">
              <h3 className="font-semibold text-accent">
                <a
                  href={`https://github.com/${stargazer.login}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {stargazer.login}
                </a>
              </h3>

              <div className="flex items-baseline gap-2">
                <ClockIcon className="h-4 w-4 text-grey relative top-[2px]" />
                <span>Starred {formatDate(stargazer.starredAt)}</span>
              </div>

              {stargazer.location && (
                <div className="flex items-baseline gap-2">
                  <LocationIcon className="h-4 w-4 text-grey relative top-[2px]" />
                  <span>{stargazer.location}</span>
                </div>
              )}
              {stargazer.company && (
                <div className="flex items-baseline gap-2">
                  <OrganizationIcon className="h-4 w-4 text-grey relative top-[2px]" />
                  <span>{stargazer.company}</span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <Pagination
        totalCount={repo.stargazers.length}
        currentPage={currentPage}
        perPage={MAX_NO_OF_STARGAZERS_PER_PAGE}
        baseURL="/stargazers?page="
      />
    </section>
  );
}

function StargazersPageSkeleton() {
  return (
    <section className="px-5 flex flex-col gap-4">
      <h1 className="text-2xl border-b border-neutral pb-4">Stargazers</h1>

      <ol className="grid gap-4 md:grid-cols-3">
        {range(1, 45).map((index) => (
          <li
            key={index}
            className="flex gap-4 items-start border-b border-neutral py-4"
          >
            <Skeleton
              shape="circle"
              className="h-12 w-12 flex-shrink-0"
              aria-label="avatar"
            />
            <div className="flex flex-col gap-4 w-full">
              <Skeleton className="h-5 w-full block" aria-label="login" />

              <div
                className="flex items-baseline gap-2"
                aria-label="starred at"
              >
                <Skeleton className="h-5 w-5 block" />
                <Skeleton className="h-5 w-full block" />
              </div>

              <div
                className="flex items-baseline gap-2 w-2/3"
                aria-label="location"
              >
                <Skeleton className="h-5 w-5 block" />
                <Skeleton className="h-5 w-full block" />
              </div>

              <div
                className="flex items-baseline gap-2 w-1/2"
                aria-label="company"
              >
                <Skeleton className="h-5 w-5 block" />
                <Skeleton className="h-5 w-full block" />
              </div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
