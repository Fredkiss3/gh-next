import * as React from "react";

export type CounterBadgeProps = {
  count: number;
};

export function CounterBadge({ count }: CounterBadgeProps) {
  return (
    <>
      <span className="bg-neutral rounded-full px-2 text-foreground">
        {count}
      </span>
      <span className="sr-only">({count})</span>
    </>
  );
}
