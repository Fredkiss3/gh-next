import { IssueOpenedIcon } from "@primer/octicons-react";
import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type IssueRowSkeletonProps = {};

export function IssueRowSkeleton({}: IssueRowSkeletonProps) {
  return (
    <div className="flex w-full items-start gap-4 border-b border-neutral/70 p-5">
      <IssueOpenedIcon className="h-5 w-5 flex-shrink-0 text-success" />
      <div className={clsx("flex w-full flex-col items-start gap-2 ")}>
        <span className="sr-only">Loading issue...</span>
        <div className="flex w-full justify-between gap-4">
          <div className="h-4 w-full animate-pulse rounded bg-neutral sm:w-[70%]" />
          <div className="hidden h-4 w-6 animate-pulse rounded bg-neutral sm:block" />
        </div>

        <div className="h-4 w-[60%] animate-pulse rounded bg-neutral sm:w-1/5" />
        <div className="h-2 w-[55%] animate-pulse rounded bg-neutral sm:w-1/2" />
      </div>
    </div>
  );
}
