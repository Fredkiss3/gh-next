"use client";
import * as React from "react";
// components
import { InfoIcon } from "@primer/octicons-react";
import { Input } from "~/app/(components)/input";
import { MarkdownTextArea } from "~/app/(components)/issues/markdown-text-area";
import { SubmitButton } from "~/app/(components)/submit-button";

// types
export type NewIssueFormProps = {
  currentUserUsername: string;
  currentUserAvatarUrl: string;
};

export function NewIssueForm({}: NewIssueFormProps) {
  return (
    <section className="flex flex-col px-5">
      <form className="grid gap-4 md:grid-cols-5 md:place-items-end">
        <div className="flex flex-col gap-4 md:col-span-3">
          <Input
            name="title"
            required
            label="Add a title"
            placeholder="Title"
            autoFocus
          />

          <MarkdownTextArea
            name="body"
            label="Add a description"
            placeholder="Add your description here..."
            required
          />

          <small className="text-grey flex gap-2 items-start">
            <InfoIcon className="flex-none h-4 w-4 relative top-0.5" />
            <p>
              Remember, contributions to this repository should follow the&nbsp;
              <a
                target="_blank"
                rel="noreferrer"
                className="text-accent underline rounded-sm ring-accent focus:outline-none focus:ring-2"
                href="https://docs.github.com/fr/site-policy/github-terms/github-community-guidelines"
              >
                GitHub Community Guidelines
              </a>
              .
            </p>
          </small>
        </div>

        <aside className="md:col-span-2"></aside>

        <SubmitButton loadingMessage="Submitting..." className="md:col-start-3">
          Submit new issue
        </SubmitButton>
      </form>
    </section>
  );
}
