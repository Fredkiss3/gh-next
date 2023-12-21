import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type SkeletonProps = {
  className?: string;
  shape?: "rectangle" | "circle";
  "aria-label"?: string;
};

export function Skeleton({
  className,
  shape = "rectangle",
  "aria-label": ariaLabel
}: SkeletonProps) {
  return (
    <div
      aria-hidden={!ariaLabel}
      aria-label={ariaLabel}
      className={clsx(
        "animate-pulse bg-grey/60",
        {
          "rounded-md": shape === "rectangle",
          "rounded-full": shape === "circle"
        },
        className
      )}
    />
  );
}
