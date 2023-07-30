import * as React from "react";
import { clsx } from "~/lib/shared-utils";

export type BadgeProps = {
  label: string;
  className?: string;
};

export function Badge({ label, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        className,
        "font-normal bg-transparent text-grey border-neutral rounded-full px-2 border text-sm"
      )}
    >
      {label}
    </span>
  );
}
