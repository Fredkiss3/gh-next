import * as React from "react";

export type CounterBadgeProps = {
  count: number;
};

export function CounterBadge({ count }: CounterBadgeProps) {
  return (
    <>
      <span className="bg-neutral rounded-full px-2 text-foreground text-sm">
        {new Intl.NumberFormat("en-US", { notation: "compact" }).format(count)}
      </span>
      <span className="sr-only">({count})</span>
    </>
  );
}
