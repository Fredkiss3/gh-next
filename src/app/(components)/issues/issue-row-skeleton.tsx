import { IssueOpenedIcon } from "@primer/octicons-react";
import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type IssueRowSkeletonProps = {};

export function IssueRowSkeleton({}: IssueRowSkeletonProps) {
  return (
    <div className="flex w-full gap-4 items-start p-5 border-b border-neutral/70">
      <IssueOpenedIcon className="h-5 w-5 flex-shrink-0 text-success" />
      <div className={clsx("flex flex-col items-start gap-2 w-full ")}>
        <span className="sr-only">Loading issue...</span>
        <div className="flex justify-between w-full gap-4">
          <div className="bg-neutral h-4 rounded animate-pulse w-full sm:w-[70%]" />
          <div className="hidden sm:block bg-neutral h-4 w-6 rounded animate-pulse" />
        </div>

        <div className="bg-neutral h-4 rounded animate-pulse w-[60%] sm:w-1/5" />
        <div className="bg-neutral h-2 rounded animate-pulse w-[55%] sm:w-1/2" />
      </div>
    </div>
  );
}
