import * as React from "react";

export type BadgeProps = {
  label: string;
};

export function Badge({ label }: BadgeProps) {
  return (
    <span className="font-normal bg-transparent text-grey border-neutral rounded-full px-2 border text-sm">
      {label}
    </span>
  );
}
