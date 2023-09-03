import * as React from "react";

// components
import {
  EyeIcon,
  RepoForkedIcon,
  StarIcon,
  TriangleDownIcon,
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
  GITHUB_REPOSITORY_NAME,
} from "~/lib/shared/constants";
import { clsx } from "~/lib/shared/utils.shared";

export default function Loading() {
  return (
    <div className={clsx("flex flex-col", "sm:gap-4")}>
      <section
        id="repository-header-desktop"
        className={clsx(
          "pb-6 border-b border-neutral px-8",
          "hidden items-center justify-between flex-wrap",
          "md:flex",
          "xl:px-0 xl:mx-8"
        )}
      >
        <h1 className="text-2xl font-semibold flex items-center gap-3">
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
          "pb-6 px-5",
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

        <ul className="flex items-center flex-wrap gap-4">
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
          "md:grid items-start gap-4",
          "sm:px-5",
          "md:grid-cols-11 md:px-8",
          "lg:grid-cols-[repeat(13,_minmax(0,_1fr))]",
          "xl:grid-cols-[repeat(15,_minmax(0,_1fr))]"
        )}
      >
        <div
          id="readme-content"
          className="md:col-span-7 lg:col-span-9 xl:col-span-11 w-full"
        >
          <div
            className={clsx(
              "border border-neutral flex items-center gap-2 p-4",
              "sticky -top-1 bg-backdrop z-10",
              "sm:rounded-t-md"
            )}
          >
            <button className="flex items-center justify-center p-2 rounded-md hover:bg-neutral/50">
              <Skeleton className="h-6 w-6" />
            </button>
            <h2
              className="font-semibold text-base scroll-mt-10 hover:text-accent hover:underline"
              id="readme"
            >
              <Skeleton className="h-6 w-20" />
            </h2>
          </div>

          <div
            className={clsx(
              "p-4 border-l border-r border-b border-neutral",
              "sm:rounded-b-md flex flex-col gap-4"
            )}
          >
            <Skeleton className="h-10 w-full" />

            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 md:h-48 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>

        <aside
          className={clsx(
            "hidden col-span-4 flex-col gap-6 sticky top-4",
            "md:flex"
          )}
        >
          <div className="flex flex-col items-start gap-5 border-neutral pb-6 border-b">
            <Skeleton className="h-6 w-16" />

            <div className="flex flex-col gap-3 w-full">
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

              <li className="text-grey flex items-center gap-3">
                <Skeleton className="h-5 w-28" />
              </li>

              <li className="text-grey flex items-center gap-3">
                <Skeleton className="h-5 w-24" />
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-start pb-6">
            <Skeleton className="h-6 w-36 mb-5" />
            <Skeleton className="h-2 w-full mb-3" />

            <div className="grid grid-cols-2 gap-2 w-full">
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
