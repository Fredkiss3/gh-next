import * as React from "react";
import { clsx } from "~/lib/functions";

export type CardProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={clsx(
        className,
        "rounded-md bg-subtle border-neutral border p-4"
      )}
    >
      {children}
    </div>
  );
}
