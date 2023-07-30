"use client";
import * as React from "react";

// components
import { ActionList } from "./action-list";
import { Button } from "./button";
import {
  CheckIcon,
  LinkExternalIcon,
  TriangleDownIcon,
} from "@primer/octicons-react";

// utils
import { useForm } from "~/lib/hooks/use-form";
import { clsx } from "~/lib/functions";
import { IssueListSearchInput } from "./issue-list-search-input";
import Link from "next/link";

// types
export type IssuesListHeaderFormProps = {
  className?: string;
};

export function IssuesListHeaderForm({ className }: IssuesListHeaderFormProps) {
  const { Form } = useForm();
  return (
    <Form method="get" className={clsx(className, "w-full flex items-center")}>
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
            onClick={onCloseList}
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

      <IssueListSearchInput />
    </Form>
  );
}
