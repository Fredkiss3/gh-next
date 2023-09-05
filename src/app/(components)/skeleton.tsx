import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type SkeletonProps = {
  className?: string;
  shape?: "rectangle" | "circle";
};

export function Skeleton({ className, shape = "rectangle" }: SkeletonProps) {
  return (
    <div
      className={clsx(className, "animate-pulse bg-grey/60", {
        "rounded-md": shape === "rectangle",
        "rounded-full": shape === "circle"
      })}
    />
  );
}
