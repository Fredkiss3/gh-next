import * as React from "react";
// components
import { Button } from "~/app/(components)/button";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { IssuesListHeaderForm } from "~/app/(components)/issues/issues-list-header-form";
import { SegmentedLayout } from "~/app/(components)/segmented-layout";
import { ClearSearchButtonSection } from "~/app/(components)/issues/clear-search-button";
import { ReactQueryProvider } from "~/app/(components)/react-query-provider";
import { LightBulbIcon, MilestoneIcon, TagIcon } from "@primer/octicons-react";
import { IssueListSkeleton } from "~/app/(components)/issues/issue-list-skeleton";
import { IssueSearchLink } from "~/app/(components)/issues/issue-search-link";
import { IssueList } from "~/app/(components)/issues/issue-list";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { getAuthedUser } from "~/app/(actions)/auth";
import { getLabelsCount } from "~/app/(models)/label";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";
export const metadata: Metadata = {
  title: "Issues"
};

export default function IssuesListPage({
  searchParams
}: PageProps<{}, { q: string; page: string }>) {
  return (
    <ReactQueryProvider>
      <div className={clsx("flex flex-col items-stretch gap-4", "md:px-8")}>
        <IssuesListHeader />
        <ClearSearchButtonSection />
        <IssuesListBody params={searchParams} />
      </div>
    </ReactQueryProvider>
  );
}

async function IssuesListHeader() {
  const isAuthed = (await getAuthedUser()) !== null;
  const labelCount = await getLabelsCount();
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
              Labels <CounterBadge count={labelCount} />
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
  return (
    <section className="flex flex-col gap-4" id="issue-list">
      <React.Suspense fallback={<IssueListSkeleton />} key={props.params?.q}>
        <IssueList page={props.params?.page} searchQuery={props.params?.q} />
      </React.Suspense>

      <div className="flex items-start justify-center gap-2 px-5 py-12 text-grey md:px-0">
        <LightBulbIcon className="h-5 w-5" />
        <p>
          <strong className="text-foreground">ProTip!</strong> Ears burning? Get
          mentions with&nbsp;
          <IssueSearchLink
            filters={{
              mentions: "@me"
            }}
            className={clsx(
              "text-accent",
              "transition duration-150",
              "focus:ring-2 ring-accent focus:outline-none rounded-md"
            )}
          >
            mentions:@me
          </IssueSearchLink>
        </p>
      </div>
    </section>
  );
}
