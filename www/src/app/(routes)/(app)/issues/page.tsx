// components
import {
  CheckIcon,
  IssueOpenedIcon,
  LightBulbIcon,
  MilestoneIcon,
  TagIcon,
  XIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { Button } from "~/app/(components)/button";
import { CounterBadge } from "~/app/(components)/counter-badge";
import { IssuesListHeaderForm } from "~/app/(components)/issues-list-header-form";
import { SegmentedLayout } from "~/app/(components)/segmented-layout";

// utils
import { clsx } from "~/lib/functions";

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

async function IssuesListBody(props: { params: PageProps["searchParams"] }) {
  return (
    <section className="flex flex-col gap-4" id="issue-list">
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

        <div className="flex items-center gap-4 lg:hidden">
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

      {/* Empty state */}
      <div
        className={clsx(
          "border border-neutral flex flex-col py-24 px-12 justify-center items-center gap-4",
          "md:rounded-md"
        )}
      >
        <IssueOpenedIcon className="h-6 w-6 text-grey" />

        <h3 className="text-2xl font-semibold">Welcome to issues!</h3>

        <p className="text-center text-grey text-lg">
          Issues are used to track todos, bugs, feature requests, and more. As
          issues are created, they’ll appear here in a searchable and filterable
          list. To get started, you should&nbsp;
          <Link href="/issues/new" className="text-accent">
            create an issue
          </Link>
          .
        </p>
      </div>

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
              // @ts-expect-error Not implemented
              href="/milestones"
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
