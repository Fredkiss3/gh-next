import * as React from "react";
import { Skeleton } from "~/app/(components)/skeleton";
import { clsx } from "~/lib/shared/utils.shared";

export type MarkdownSkeletonProps = {
  className?: string;
  size?: "short" | "long";
};

// TODO : comment fallback
export function MarkdownSkeleton({
  className,
  size = "long"
}: MarkdownSkeletonProps) {
  return (
    <div
      className={clsx(
        "w-full",
        "flex flex-col gap-4 sm:rounded-b-md",
        className
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
  );
}
