import * as React from "react";
// components
import {
  CheckIcon,
  IssueOpenedIcon,
  LightBulbIcon,
  MilestoneIcon,
  TagIcon,
  TriangleDownIcon,
  XIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { Button } from "~/app/(components)/button";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { IssuesListHeaderForm } from "~/app/(components)/issues-list-header-form";
import { SegmentedLayout } from "~/app/(components)/segmented-layout";
import { IssueAuthorFilterActionList } from "~/app/(components)/issue-author-filter-action-list";
import { IssueLabelFilterActionList } from "~/app/(components)/issue-label-filter-action-list";
import { IssueAssigneeFilterActionList } from "~/app/(components)/issue-assignee-filter-action-list";
import { IssueSortActionList } from "~/app/(components)/issue-sort-action-list";
import { IssueRowSkeleton } from "~/app/(components)/issue-row-skeleton";
import { Pagination } from "~/app/(components)/pagination";
import { IssueRow } from "~/app/(components)/issue-row";

// utils
import { clsx } from "~/lib/shared-utils";
import { getIssueList } from "~/app/(actions)/issue";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";

export const metadata: Metadata = {
  title: "Issues",
};

export default function IssuesListPage({ searchParams }: PageProps) {
  return (
    <div className={clsx("flex flex-col items-stretch gap-4", "md:px-8")}>
      <IssuesListHeader />
      <IssuesListBody params={searchParams} />
    </div>
  );
}

function IssuesListHeader() {
  return (
    <section
      className="flex flex-col gap-4 px-5 md:px-0 md:flex-row"
      id="search-bar"
    >
      <IssuesListHeaderForm className="order-last md:order-first" />
      <div className="flex justify-between gap-4 items-center">
        <SegmentedLayout>
          <li>
            <Button
              // @ts-ignore
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

async function IssuesListBody(props: { params: PageProps["searchParams"] }) {
  let currentPage = Number(props.params?.page);
  if (isNaN(currentPage)) {
    currentPage = 1;
  }
  return (
    <section className="flex flex-col gap-4" id="issue-list">
      <React.Suspense
        // key={Math.random()}
        fallback={<IssueContentTableSkeleton />}
      >
        <IssueContentTable currentPage={currentPage} />
      </React.Suspense>

      <div className="px-5 md:px-0 justify-center text-grey flex items-start gap-2 py-12">
        <LightBulbIcon className="h-5 w-5" />
        <p>
          <strong className="text-foreground">ProTip!</strong> Ears burning? Get
          mentions with&nbsp;
          <Link href="/issues?q=is:open+mention:@me" className="text-accent">
            mentions:@me.
          </Link>
        </p>
      </div>
    </section>
  );
}

function IssueContentTableSkeleton() {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 md:px-0">
        <div className="flex items-center gap-4 md:hidden">
          <Link
            href="/issues?q=is:open"
            className={clsx(
              "font-semibold text-foreground flex items-center gap-2"
            )}
          >
            <IssueOpenedIcon className="h-5 w-5" />
            <p>
              - <span className="sr-only">issues</span>&nbsp;Open
            </p>
          </Link>
          <Link
            href="/issues?q=is:closed"
            className={clsx("text-grey flex items-center gap-2")}
          >
            <CheckIcon className="h-5 w-5" />
            <span>
              - <span className="sr-only">issues</span>&nbsp;Closed
            </span>
          </Link>
        </div>
      </div>

      <div className={clsx("border border-neutral", "sm:rounded-md")}>
        {/* Issue content table - header */}
        <div
          className={clsx(
            "flex items-center justify-between gap-8",
            "p-5 border-b border-neutral bg-subtle text-grey"
          )}
        >
          <ul className="hidden md:flex items-center gap-4">
            <li>
              <Link
                href="/issues?q=is:open"
                className={clsx(
                  "font-semibold text-foreground flex items-center gap-2"
                )}
              >
                <IssueOpenedIcon className="h-5 w-5" />
                <p>
                  - <span className="sr-only">issues</span>&nbsp;Open
                </p>
              </Link>
            </li>
            <li>
              <Link
                href="/issues?q=is:closed"
                className={clsx("text-grey flex items-center gap-2")}
              >
                <CheckIcon className="h-5 w-5" />
                <span>
                  - <span className="sr-only">issues</span>&nbsp;Closed
                </span>
              </Link>
            </li>
          </ul>

          <ul
            className={clsx(
              "flex items-center gap-6 justify-evenly flex-grow",
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
        <ul>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
          <li>
            <IssueRowSkeleton />
          </li>
        </ul>
        {/* END Issue content table - list */}
      </div>
    </>
  );
}

type IssueContentTableProps = {
  currentPage: number;
};

async function IssueContentTable({ currentPage }: IssueContentTableProps) {
  // await wait(2000);

  const issues = await getIssueList();
  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 px-5 md:px-0">
        <Link
          href="/issues"
          className="flex gap-2 items-center text-grey font-semibold group hover:text-accent"
        >
          <div className="bg-grey rounded-md p-1 flex items-center justify-center group-hover:bg-accent">
            <XIcon className="text-white h-4 w-4" />
          </div>
          <span>Clear current search query, filters, and sorts</span>
        </Link>

        <div className="flex items-center gap-4 md:hidden">
          <Link
            href="/issues?q=is:open"
            className={clsx(
              "font-semibold text-foreground flex items-center gap-2"
            )}
          >
            <IssueOpenedIcon className="h-5 w-5" />
            <p>
              0 <span className="sr-only">issues</span>&nbsp;Open
            </p>
          </Link>
          <Link
            href="/issues?q=is:closed"
            className={clsx("text-grey flex items-center gap-2")}
          >
            <CheckIcon className="h-5 w-5" />
            <span>
              0 <span className="sr-only">issues</span>&nbsp;Closed
            </span>
          </Link>
        </div>
      </div>

      <div className={clsx("border border-neutral", "sm:rounded-md")}>
        {/* Issue content table - header */}
        <div
          className={clsx(
            "flex items-center justify-between gap-8",
            "p-5 border-b border-neutral bg-subtle text-grey"
          )}
        >
          <ul className="hidden md:flex items-center gap-4">
            <li>
              <Link
                href="/issues?q=is:open"
                className={clsx(
                  "font-semibold text-foreground flex items-center gap-2"
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
                href="/issues?q=is:closed"
                className={clsx("text-grey flex items-center gap-2")}
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
              "flex items-center gap-6 justify-evenly flex-grow",
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
    <div className="flex flex-col py-24 px-12 justify-center items-center gap-4">
      <IssueOpenedIcon className="h-6 w-6 text-grey" />

      <h3 className="text-2xl font-semibold">Nothing to see here!</h3>

      <p className="text-center text-grey text-lg">
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
