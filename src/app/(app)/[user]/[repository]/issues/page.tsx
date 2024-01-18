import * as React from "react";
// components
import { Button } from "~/components/button";
import { CounterBadge } from "~/components/counter-badge";
import { IssuesListHeaderForm } from "~/components/issues/issues-list-header-form";
import { SegmentedLayout } from "~/components/segmented-layout";
import { ClearSearchButtonSection } from "~/components/issues/clear-search-button";
import { LightBulbIcon, MilestoneIcon, TagIcon } from "@primer/octicons-react";
import { IssueListSkeleton } from "~/components/issues/issue-list-skeleton";
import { IssueSearchLink } from "~/components/issues/issue-search-link";
import { IssueList } from "~/components/issues/issue-list";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { getAuthedUser } from "~/actions/auth.action";
import { getLabelsCount } from "~/models/label";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";

export const metadata: Metadata = {
  title: "Issues"
};

type IssueListPageProps = PageProps<
  {
    user: string;
    repository: string;
  },
  { page: string; q: string }
>;

export default function IssuesListPage({
  searchParams,
  params
}: IssueListPageProps) {
  return (
    <div className={clsx("flex flex-col items-stretch gap-4", "md:px-8")}>
      <IssuesListHeader {...params} />
      <ClearSearchButtonSection />
      <IssuesListBody params={params} searchParams={searchParams} />
    </div>
  );
}

async function IssuesListHeader(props: { user: string; repository: string }) {
  const [authedUser, labelCount] = await Promise.all([
    getAuthedUser(),
    getLabelsCount()
  ]);

  const isAuthed = authedUser !== null;
  return (
    <section
      className="flex flex-col gap-4 px-5 md:flex-row md:px-0 max-w-full"
      id="search-bar"
    >
      <IssuesListHeaderForm
        className="order-last md:order-first"
        showActionList={isAuthed}
      />

      <div className="flex items-center justify-between gap-4 flex-shrink-0">
        <SegmentedLayout>
          <li>
            <Button
              href={`/${props.user}/${props.repository}/labels`}
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

        <Button href={`/${props.user}/${props.repository}/issues/new`}>
          New<span className="sr-only md:not-sr-only">issue</span>
        </Button>
      </div>
    </section>
  );
}

async function IssuesListBody(props: IssueListPageProps) {
  return (
    <section className="flex flex-col gap-4" id="issue-list">
      <React.Suspense
        fallback={<IssueListSkeleton />}
        key={props.searchParams?.q}
      >
        <IssueList
          user={props.params.user}
          repository={props.params.repository}
          page={props.searchParams?.page}
          searchQuery={props.searchParams?.q}
        />
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
