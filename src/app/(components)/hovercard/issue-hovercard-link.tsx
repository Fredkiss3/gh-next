"use client";

import * as React from "react";
// components
import { HoverCard } from "~/app/(components)/hovercard/hovercard";
import { ReactAriaLink } from "~/app/(components)/react-aria-button";

// utils
import { IssueHoverCardSkeleton } from "~/app/(components)/hovercard/issue-hovercard-contents";
import { useIssueHoverCardContents } from "~/app/(components)/hovercard/use-async-issue-hovercard-contents";

export type IssueHoverCardLinkProps = {
  user: string;
  repository: string;
  no: number;
  children: React.ReactNode;
  className?: string;
  href: string;
};

export function IssueHoverCardLink({
  children,
  className,
  href,
  ...props
}: IssueHoverCardLinkProps) {
  const [canLoadIssueContent, setCanLoadIssueContent] = React.useState(false);

  return (
    <HoverCard
      content={canLoadIssueContent ? <IssueContents {...props} /> : <></>}
      onOpenChange={(open) => {
        // only once
        if (open && !canLoadIssueContent) {
          setCanLoadIssueContent(true);
        }
      }}
    >
      <ReactAriaLink href={href} className={className}>
        {children}
      </ReactAriaLink>
    </HoverCard>
  );
}

function IssueContents({
  user,
  repository,
  no
}: Pick<IssueHoverCardLinkProps, "user" | "repository" | "no">) {
  const { data: contents } = useIssueHoverCardContents({
    user,
    repository,
    no
  });

  if (!contents) {
    return <IssueHoverCardSkeleton />;
  }

  return <>{contents}</>;
}
