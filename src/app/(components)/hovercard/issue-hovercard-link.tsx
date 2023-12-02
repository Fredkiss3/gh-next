"use client";

import * as React from "react";
import { use, cache } from "react";
// components
import { HoverCard } from "~/app/(components)/hovercard/hovercard";
import { ReactAriaLink } from "~/app/(components)/react-aria-button";

// utils
import { getIssueHoverCardContents } from "~/app/(actions)/issue";
import { IssueHoverCardSkeleton } from "~/app/(components)/hovercard/issue-hovercard-contents";

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
      content={
        canLoadIssueContent ? (
          <React.Suspense fallback={<IssueHoverCardSkeleton />}>
            <IssueContents {...props} />
          </React.Suspense>
        ) : (
          <></>
        )
      }
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

const loadIssueContents = cache(getIssueHoverCardContents);

function IssueContents({
  user,
  repository,
  no
}: Pick<IssueHoverCardLinkProps, "user" | "repository" | "no">) {
  const contents = use(loadIssueContents(user, repository, no));
  return <>{contents}</>;
}
