"use client";
import * as React from "react";
import { clsx } from "~/lib/shared-utils";

export type IssueRowTitleProps = {
  id: number;
  children: React.ReactNode;
};

export function IssueRowTitle({ children, id }: IssueRowTitleProps) {
  return (
    <span className="relative group">
      {children}

      <div
        className={clsx(
          "hidden p-4 group-hover:block",
          "absolute w-[300px] h-[150px] z-20 bottom-[calc(100%+10px)] right-0",
          "border border-neutral bg-subtle rounded-md shadow-lg",
          "after:absolute after:-bottom-3 after:left-10 after:rotate-180",
          "after:h-3 after:w-6 after:bg-neutral",
          "after:[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)]",
          "before:z-10 before:absolute before:-bottom-2.5 before:left-10 before:rotate-180",
          "before:h-3 before:w-6 before:bg-subtle",
          "before:[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)]"
        )}
      >
        {/*  */}
      </div>
    </span>
  );
}
