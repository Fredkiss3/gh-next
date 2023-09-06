import * as React from "react";
// components
import {
  CheckIcon,
  IssueOpenedIcon,
  LightBulbIcon,
  MilestoneIcon,
  TagIcon,
  TriangleDownIcon,
  XIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { Button } from "~/app/(components)/button";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { IssuesListHeaderForm } from "~/app/(components)/issue-list/issues-list-header-form";
import { SegmentedLayout } from "~/app/(components)/segmented-layout";
import { IssueAuthorFilterActionList } from "~/app/(components)/issue-list/issue-author-filter-action-list";
import { IssueLabelFilterActionList } from "~/app/(components)/issue-list/issue-label-filter-action-list";
import { IssueAssigneeFilterActionList } from "~/app/(components)/issue-list/issue-assignee-filter-action-list";
import { IssueSortActionList } from "~/app/(components)/issue-list/issue-sort-action-list";
import { IssueRowSkeleton } from "~/app/(components)/issues/issue-row-skeleton";
import { Pagination } from "~/app/(components)/pagination";
import { IssueRow } from "~/app/(components)/issues/issue-row";
import { IssueListMainParent } from "~/app/(components)/issue-list/issue-list-main-parent";
import { ClearSearchButtonSection } from "~/app/(components)/issue-list/clear-search-button";
import { ReactQueryProvider } from "~/app/(components)/react-query-provider";

// utils
import { clsx, wait } from "~/lib/shared/utils.shared";
import { getIssueList } from "~/app/(actions)/issue";
import { getAuthedUser } from "~/app/(actions)/auth";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";
import { IssueContentTableSkeleton } from "~/app/(components)/issues/issue-content-table-skeleton";

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
      <React.Suspense
        fallback={<IssueContentTableSkeleton />}
        key={props.params?.q}
      >
        <IssueContentTable currentPage={currentPage} />
      </React.Suspense>

      <div className="flex items-start justify-center gap-2 px-5 py-12 text-grey md:px-0">
        <LightBulbIcon className="h-5 w-5" />
        <p>
          <strong className="text-foreground">ProTip!</strong> Ears burning? Get
          mentions with&nbsp;
          <Link
            href="/issues?q=is:open+mention:@me"
            className="text-accent"
            prefetch={false}
          >
            mentions:@me.
          </Link>
        </p>
      </div>
    </section>
  );
}

type IssueContentTableProps = {
  currentPage: number;
};

async function IssueContentTable({ currentPage }: IssueContentTableProps) {
  await wait(500);

  const issues = await getIssueList();
  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 px-5  md:hidden md:px-0">
        <Link
          prefetch={false}
          href="/issues?q=is:open"
          className={clsx(
            "flex items-center gap-2 font-semibold text-foreground"
          )}
        >
          <IssueOpenedIcon className="h-5 w-5" />
          <p>
            0 <span className="sr-only">issues</span>&nbsp;Open
          </p>
        </Link>
        <Link
          prefetch={false}
          href="/issues?q=is:closed"
          className={clsx("flex items-center gap-2 text-grey")}
        >
          <CheckIcon className="h-5 w-5" />
          <span>
            0 <span className="sr-only">issues</span>&nbsp;Closed
          </span>
        </Link>
      </div>

      <div className={clsx("border border-neutral", "sm:rounded-md")}>
        {/* Issue content table - header */}
        <div
          className={clsx(
            "flex items-center justify-between gap-8",
            "border-b border-neutral bg-subtle p-5 text-grey"
          )}
        >
          <ul className="hidden items-center gap-4 md:flex">
            <li>
              <Link
                prefetch={false}
                href="/issues?q=is:open"
                className={clsx(
                  "flex items-center gap-2 font-semibold text-foreground"
                )}
              >
                <IssueOpenedIcon className="h-5 w-5" />
                <p>
                  0 <span className="sr-only">issues</span>&nbsp;Open
                </p>
              </Link>
            </li>
            <li>
              <Link
                prefetch={false}
                href="/issues?q=is:closed"
                className={clsx("flex items-center gap-2 text-grey")}
              >
                <CheckIcon className="h-5 w-5" />
                <span>
                  0 <span className="sr-only">issues</span>&nbsp;Closed
                </span>
              </Link>
            </li>
          </ul>

          <ul
            className={clsx(
              "flex flex-grow items-center justify-evenly gap-6",
              "sm:justify-start",
              "md:flex-grow-0"
            )}
          >
            <li>
              <IssueAuthorFilterActionList>
                <button className="flex items-center gap-2">
                  <span>Author</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueAuthorFilterActionList>
            </li>
            <li>
              <IssueLabelFilterActionList>
                <button className="flex items-center gap-2">
                  <span>Label</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueLabelFilterActionList>
            </li>
            <li>
              <IssueAssigneeFilterActionList>
                <button className="flex items-center gap-2">
                  <span>Assignee</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueAssigneeFilterActionList>
            </li>
            <li>
              <IssueSortActionList>
                <button className="flex items-center gap-2">
                  <span>Sort</span> <TriangleDownIcon className="h-5 w-5" />
                </button>
              </IssueSortActionList>
            </li>
          </ul>
        </div>
        {/* END Issue content table - header */}

        {/* Issue content table - list */}
        {/* <EmptyState /> */}

        <ul>
          {issues.map((issue) => (
            <li key={issue.id}>
              <IssueRow {...issue} />
            </li>
          ))}
        </ul>

        {/* END Issue content table - list */}
      </div>

      <Pagination
        currentPage={currentPage}
        perPage={5}
        totalCount={50}
        baseURL="/issues?q=is:open&page="
      />
    </>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-12 py-24">
      <IssueOpenedIcon className="h-6 w-6 text-grey" />

      <h3 className="text-2xl font-semibold">Nothing to see here!</h3>

      <p className="text-center text-lg text-grey">
        Either no issue matched your search or there is not issue yet in the
        database. <br /> You can still &nbsp;
        <Link href="/issues/new" className="text-accent">
          create a new issue
        </Link>
        .
      </p>
    </div>
  );
}
