"use client";
import * as React from "react";

// components
import { ActionList } from "./action-list";
import { Button } from "./button";
import { Input } from "./input";
import { LinkExternalIcon, TriangleDownIcon } from "@primer/octicons-react";

// utils
import { useForm } from "~/lib/hooks/use-form";
import { useSearchParams } from "next/navigation";
import { clsx } from "~/lib/functions";

// types
export type IssuesListHeaderFormProps = {
  className?: string;
};

export function IssuesListHeaderForm({ className }: IssuesListHeaderFormProps) {
  const params = useSearchParams();
  const { Form } = useForm();
  return (
    <Form method="get" className={clsx(className, "w-full flex items-center")}>
      <ActionList
        items={[
          {
            href: "/issues?q=is:open",
            text: "Open issues",
          },
          {
            href: "/issues?q=is:open+author:@me",
            text: "Your issues",
          },
          {
            href: "/issues?q=is:open+assignee:@me",
            text: "Everything assigned to you",
          },
          {
            href: "/issues?q=is:open+mention:@me",
            text: "Everything mentionning you",
          },
        ]}
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
          variant="ghost"
          className="rounded-r-none !border-r-0"
          renderTrailingIcon={(cls) => <TriangleDownIcon className={cls} />}
        >
          Filters
        </Button>
      </ActionList>

      <Input
        name="q"
        autoFocus
        type="text"
        // defaultValue={}
        className="rounded-l-none flex-grow"
        placeholder="Search all issues"
        label="input your search"
        hideLabel
      />
    </Form>
  );
}
