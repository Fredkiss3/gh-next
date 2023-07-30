"use client";
import * as React from "react";
import { getIssuePopover } from "~/app/(actions)/issue";

export type IssueRowTitleProps = {
  id: number;
  children: React.ReactNode;
};

const getIssueOnHover = React.cache(getIssuePopover);

export function IssueRowTitle({ children, id }: IssueRowTitleProps) {
  const [hasHovered, setHasHovered] = React.useState(false);
  return (
    <span
      className="relative group"
      onMouseEnter={() => {
        if (!hasHovered) {
          setHasHovered(true);
        }
      }}
    >
      {children}

      {hasHovered && (
        <React.Suspense fallback={<></>}>{getIssueOnHover(id)}</React.Suspense>
      )}
    </span>
  );
}
