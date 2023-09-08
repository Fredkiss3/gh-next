import * as React from "react";

// components
import {
  EyeIcon,
  RepoForkedIcon,
  StarIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import { Avatar } from "~/app/(components)/avatar";
import { Badge } from "~/app/(components)/badge";
import { Button } from "~/app/(components)/button";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { Skeleton } from "~/app/(components)/skeleton";

// utils
import {
  GITHUB_AUTHOR_USERNAME,
  AUTHOR_AVATAR_URL,
  GITHUB_REPOSITORY_NAME
} from "~/lib/shared/constants";
import { clsx } from "~/lib/shared/utils.shared";

export default function Loading() {
  return (
    <div className={clsx("flex flex-col", "sm:gap-4")}>
      <section
        id="repository-header-desktop"
        className={clsx(
          "border-b border-neutral px-8 pb-6",
          "hidden flex-wrap items-center justify-between",
          "md:flex",
          "xl:mx-8 xl:px-0"
        )}
      >
        <h1 className="flex items-center gap-3 text-2xl font-semibold">
          <Avatar
            username={GITHUB_AUTHOR_USERNAME}
            src={AUTHOR_AVATAR_URL}
            size="small"
          />
          <span>gh-next</span>

          <Badge label="Public" />
        </h1>

        <div className="flex items-center gap-3">
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <EyeIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Watch
            <CounterBadge />
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/fork`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <RepoForkedIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            Fork
            <CounterBadge />
          </Button>
          <Button
            href={`https://github.com/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`}
            variant="subtle"
            renderLeadingIcon={(cls) => (
              <StarIcon className={clsx(cls, "text-grey")} />
            )}
            renderTrailingIcon={(cls) => (
              <TriangleDownIcon className={clsx(cls, "text-grey")} />
            )}
          >
            <span>Star</span>
            <CounterBadge />
          </Button>
        </div>
      </section>

      <section
        id="repository-header-mobile"
        className={clsx(
          "px-5 pb-6",
          "flex flex-col items-start gap-5 border-neutral",
          "sm:border-b",
          "md:hidden"
        )}
      >
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
          <Skeleton className="h-9 w-9" />
        </div>

        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-72" />

        <ul className="flex flex-wrap items-center gap-4">
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
          <li>
            <Skeleton className="h-5 w-20" />
          </li>
        </ul>
        <Skeleton className="h-4 w-60" />
      </section>

      <section
        id="body"
        className={clsx(
          "items-start gap-4 md:grid",
          "sm:px-5",
          "md:grid-cols-11 md:px-8",
          "lg:grid-cols-[repeat(13,_minmax(0,_1fr))]",
          "xl:grid-cols-[repeat(15,_minmax(0,_1fr))]"
        )}
      >
        <div
          id="readme-content"
          className="w-full md:col-span-7 lg:col-span-9 xl:col-span-11"
        >
          <div
            className={clsx(
              "flex items-center gap-2 border border-neutral p-4",
              "sticky -top-1 z-10 bg-backdrop",
              "sm:rounded-t-md"
            )}
          >
            <button className="flex items-center justify-center rounded-md p-2 hover:bg-neutral/50">
              <Skeleton className="h-6 w-6" />
            </button>
            <h2
              className="scroll-mt-10 text-base font-semibold hover:text-accent hover:underline"
              id="readme"
            >
              <Skeleton className="h-6 w-20" />
            </h2>
          </div>

          <div
            className={clsx(
              "border-b border-l border-r border-neutral p-4",
              "flex flex-col gap-4 sm:rounded-b-md"
            )}
          >
            <Skeleton className="h-10 w-full" />

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full md:h-48" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        <aside
          className={clsx(
            "sticky top-4 col-span-4 hidden flex-col gap-6",
            "md:flex"
          )}
        >
          <div className="flex flex-col items-start gap-5 border-b border-neutral pb-6">
            <Skeleton className="h-6 w-16" />

            <div className="flex w-full flex-col gap-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-16" />
            </div>

            <Skeleton className="h-4 w-full" />

            <ul className="flex flex-col items-start gap-3">
              <li>
                <Skeleton className="h-5 w-24" />
              </li>

              <li>
                <Skeleton className="h-5 w-24" />
              </li>

              <li>
                <Skeleton className="h-5 w-24" />
              </li>

              <li className="flex items-center gap-3 text-grey">
                <Skeleton className="h-5 w-28" />
              </li>

              <li className="flex items-center gap-3 text-grey">
                <Skeleton className="h-5 w-24" />
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start pb-6">
            <Skeleton className="mb-5 h-6 w-36" />
            <Skeleton className="mb-3 h-2 w-full" />

            <div className="grid w-full grid-cols-2 gap-2">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
