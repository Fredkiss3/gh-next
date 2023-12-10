"use client";

import * as React from "react";
// components
import Link from "next/link";
import { HoverCard } from "~/app/(components)/hovercard/hovercard";
import { IssueHoverCardSkeleton } from "~/app/(components)/hovercard/issue-hovercard-contents";
import { ErrorBoundary } from "react-error-boundary";

// utils
import { getIssueHoverCard } from "~/app/(actions)/issue.action";

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
          <ErrorBoundary
            FallbackComponent={({ error }) => (
              <div className="flex flex-col gap-2 p-2 w-[350px]">
                <span className="font-semibold">Error loading hovercard</span>
                <code className="rounded-md bg-neutral text-red-400 px-1.5 py-1">
                  {error.toString()}
                </code>
              </div>
            )}
          >
            <React.Suspense fallback={<IssueHoverCardSkeleton />}>
              <IssueContents {...props} />
            </React.Suspense>
          </ErrorBoundary>
        ) : (
          <>
            <IssueHoverCardSkeleton />
          </>
        )
      }
      onOpenChange={(open) => {
        // only once
        if (open && !canLoadIssueContent) {
          setCanLoadIssueContent(true);
        }
      }}
    >
      <Link href={href} className={className}>
        {children}
      </Link>
    </HoverCard>
  );
}

const loadHoverCardContents = React.cache(getIssueHoverCard);

function IssueContents({
  user,
  repository,
  no
}: Pick<IssueHoverCardLinkProps, "user" | "repository" | "no">) {
  return React.use(loadHoverCardContents(user, repository, no));
}
