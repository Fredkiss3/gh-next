"use client";
import * as React from "react";

// components
import { ActionList } from "~/app/(components)/action-list";
import { Button } from "~/app/(components)/button";
import {
  CheckIcon,
  LinkExternalIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { IssueListSearchInput } from "./issue-list-search-input";

// utils
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "~/lib/shared/utils.shared";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";

// types
export type IssuesListHeaderFormProps = {
  className?: string;
};

export function IssuesListHeaderForm({ className }: IssuesListHeaderFormProps) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const router = useRouter();
  const path = usePathname();

  const setSearchQuery = useSearchQueryStore((store) => store.setQuery);

  return (
    <form
      ref={formRef}
      method="get"
      onSubmit={(e) => {
        e.preventDefault();

        // @ts-expect-error the URLSearchParams constructor supports formData
        const searchParams = new URLSearchParams(new FormData(e.currentTarget));
        router.push(path + "?" + searchParams.toString());
      }}
      className={clsx(className, "w-full flex items-center")}
    >
      <ActionList
        items={[
          {
            items: [
              {
                href: "/issues?q=is:open" as const,
                text: "Open issues",
              },
              {
                href: "/issues?q=is:open+author:@me" as const,
                text: "Your issues",
              },
              {
                href: "/issues?q=is:open+assignee:@me" as const,
                text: "Everything assigned to you",
              },
              {
                href: "/issues?q=is:open+mention:@me" as const,
                text: "Everything mentionning you",
              },
            ],
          },
        ]}
        renderItem={({ text, selected, onCloseList, href, className }) => (
          <Link
            prefetch={false}
            onClick={() => {
              const url = new URL(
                href,
                window.location.protocol + "//" + window.location.host
              );
              const query = url.searchParams.get("q")?.toString() ?? "is:open";

              setSearchQuery(query);
              onCloseList();
            }}
            href={href}
            className={clsx(
              className,
              "flex items-center gap-2 hover:bg-neutral/50"
            )}
          >
            <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
              {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
            </div>
            <span>{text}</span>
          </Link>
        )}
        align="left"
        title="Filter issues"
        footer={
          <a
            href="https://docs.github.com/articles/searching-issues"
            target="_blank"
            className="flex items-center gap-2"
          >
            <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
              <LinkExternalIcon className="h-5 w-5 flex-shrink-0" />
            </div>
            <strong className="font-medium">View advanced search syntax</strong>
          </a>
        }
      >
        <Button
          type="button"
          variant="subtle"
          className="rounded-r-none !border-r-0"
          renderTrailingIcon={(cls) => <TriangleDownIcon className={cls} />}
        >
          Filters
        </Button>
      </ActionList>

      <IssueListSearchInput onSearch={() => formRef.current?.requestSubmit()} />
    </form>
  );
}
