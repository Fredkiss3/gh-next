import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type BadgeProps = {
  label: string;
  className?: string;
};

export function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        className,
        "rounded-full border border-neutral bg-transparent px-2 text-sm font-normal text-grey"
      )}
    >
      {label}
    </span>
  );
}
