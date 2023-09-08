import * as React from "react";

export type CounterBadgeProps = {
  count?: number;
};

export function CounterBadge({ count }: CounterBadgeProps) {
  return (
    <>
      <span
        className="rounded-full bg-neutral px-2 text-sm text-foreground"
        aria-hidden="true"
      >
        {count
          ? new Intl.NumberFormat("en-US", { notation: "compact" }).format(
              count
            )
          : "-"}
      </span>
      <span className="sr-only">({count ?? "undefined"})</span>
    </>
  );
}
