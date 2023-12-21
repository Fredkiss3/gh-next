import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

export type SegmentedLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function SegmentedLayout({ children, className }: SegmentedLayoutProps) {
  return (
    <ul
      className={clsx(
        className,
        "flex items-stretch gap-0",
        "[&>li:not(:last-child)>*]:!border-r-0",
        "[&>li:not(:first-child)>*]:!rounded-l-none",
        "[&>li:not(:last-child)>*]:!rounded-r-none"
      )}
    >
      {children}
    </ul>
  );
}
