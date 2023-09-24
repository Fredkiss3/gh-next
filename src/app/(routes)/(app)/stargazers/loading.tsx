import * as React from "react";
import { Skeleton } from "~/app/(components)/skeleton";
import { range } from "~/lib/shared/utils.shared";

export default function Loading() {
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
