import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type CardProps = {
  className?: string;
  children?: React.ReactNode;
};

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={clsx(
        className,
        "rounded-md border border-neutral bg-subtle p-4"
      )}
    >
      {children}
    </div>
  );
}
