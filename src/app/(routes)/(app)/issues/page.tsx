import * as React from "react";
// components
import Link from "next/link";
import { Button } from "~/app/(components)/button";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { IssuesListHeaderForm } from "~/app/(components)/issues/issues-list-header-form";
import { SegmentedLayout } from "~/app/(components)/segmented-layout";
import { IssueListMainParent } from "~/app/(components)/issues/issue-list-main-parent";
import { ClearSearchButtonSection } from "~/app/(components)/issues/clear-search-button";
import { ReactQueryProvider } from "~/app/(components)/react-query-provider";
import { LightBulbIcon, MilestoneIcon, TagIcon } from "@primer/octicons-react";
import { IssueListSkeleton } from "~/app/(components)/issues/issue-list-skeleton";
import { IssueListServer } from "~/app/(components)/issues/issue-list.server";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { getAuthedUser } from "~/app/(actions)/auth";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";
import { IssueSearchLink } from "~/app/(components)/issues/issue-search-link";

export const metadata: Metadata = {
  title: "Issues"
};

export default function IssuesListPage({
  searchParams
}: PageProps<{}, { q: string; page: string }>) {
  const initialQuery = searchParams?.q;

  return (
    <ReactQueryProvider>
      <div className={clsx("flex flex-col items-stretch gap-4", "md:px-8")}>
        <IssueListMainParent initialQuery={initialQuery}>
          <IssuesListHeader />
          <ClearSearchButtonSection />
          <IssuesListBody params={searchParams} />
        </IssueListMainParent>
      </div>
    </ReactQueryProvider>
  );
}

async function IssuesListHeader() {
  const isAuthed = (await getAuthedUser()) !== null;
  return (
    <section
      className="flex flex-col gap-4 px-5 md:flex-row md:px-0"
      id="search-bar"
    >
      <IssuesListHeaderForm
        className="order-last md:order-first"
        showActionList={isAuthed}
      />

      <div className="flex items-center justify-between gap-4">
        <SegmentedLayout>
          <li>
            <Button
              href="/labels"
              variant="invisible"
              className="!text-foreground"
              renderLeadingIcon={(cls) => <TagIcon className={cls} />}
            >
              Labels <CounterBadge count={0} />
            </Button>
          </li>
          <li>
            <Button
              href="#"
              variant="invisible"
              className="!text-foreground"
              renderLeadingIcon={(cls) => <MilestoneIcon className={cls} />}
            >
              Milestones <CounterBadge count={0} />
            </Button>
          </li>
        </SegmentedLayout>

        <Button href="/issues/new">
          New<span className="sr-only md:not-sr-only">issue</span>
        </Button>
      </div>
    </section>
  );
}

async function IssuesListBody(props: {
  params: PageProps<{}, { page?: string; q?: string }>["searchParams"];
}) {
  let currentPage = Number(props.params?.page);
  if (isNaN(currentPage)) {
    currentPage = 1;
  }
  return (
    <section className="flex flex-col gap-4" id="issue-list">
      <React.Suspense fallback={<IssueListSkeleton />} key={props.params?.q}>
        <IssueListServer currentPage={currentPage} />
      </React.Suspense>

      <div className="flex items-start justify-center gap-2 px-5 py-12 text-grey md:px-0">
        <LightBulbIcon className="h-5 w-5" />
        <p>
          <strong className="text-foreground">ProTip!</strong> Ears burning? Get
          mentions with&nbsp;
          <IssueSearchLink
            // href="/issues?q=is:open+mention:@me"
            filters={{
              is: "open",
              mentions: "@me"
            }}
            className="text-accent"
          >
            mentions:@me.
          </IssueSearchLink>
        </p>
      </div>
    </section>
  );
}
