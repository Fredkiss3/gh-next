"use client";
import * as React from "react";
// components
import { GearIcon, InfoIcon } from "@primer/octicons-react";
import { Input } from "~/components/input";
import { MarkdownEditor } from "~/components/markdown-editor/markdown-editor";
import { SubmitButton } from "~/components/submit-button";
import { Avatar } from "~/components/avatar";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
export type NewIssueFormProps = {
  currentUserUsername: string;
  currentUserAvatarUrl: string;
};

export function NewIssueForm({
  currentUserAvatarUrl,
  currentUserUsername
}: NewIssueFormProps) {
  return (
    <section className="grid px-5">
      <form
        style={{
          // @ts-expect-error these are CSS variables
          "--grid-area-mobile": `
          "EDT"
          "LBL"
          "ACT"
          "BTN"
          `,
          "--grid-area-md": `
          "EDT EDT ACT" 
          ".   BTN .  " 
          "LBL LBL .  "
          `,
          "--grid-area-lg": `
          "EDT EDT EDT ACT" 
          ".   .   BTN .  " 
          "LBL LBL LBL .  "
          `,
          gridTemplateRows: "auto auto auto auto"
        }}
        className={clsx(
          "grid gap-4 md:grid-cols-3 lg:grid-cols-4",
          "[grid-template-areas:var(--grid-area-mobile)]",
          "md:[grid-template-areas:var(--grid-area-md)]",
          "lg:[grid-template-areas:var(--grid-area-lg)]"
        )}
      >
        <div className="[grid-area:EDT] flex items-start gap-4 min-w-0">
          <div className="flex-none hidden md:block">
            <Avatar
              username={currentUserUsername}
              src={currentUserAvatarUrl}
              size="medium"
            />
          </div>
          <div className="flex flex-col gap-4 w-full min-w-0">
            <Input
              name="title"
              required
              label="Add a title"
              placeholder="Title"
              autoFocus
            />

            <MarkdownEditor
              name="body"
              label="Add a description"
              placeholder="Add your description here..."
              required
            />
          </div>
        </div>

        <small className="text-grey flex gap-2 items-start [grid-area:LBL] md:pl-14">
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

        <aside className="flex flex-col gap-4 w-full h-full py-4 [grid-area:ACT]">
          <AssigneeFormInput />
          <LabelFormInput />
          <div className="border-b border-neutral flex flex-col gap-2 text-sm pb-4">
            <div className="flex justify-between items-center group">
              <h3 className="text-grey font-semibold group-hover:text-accent">
                Development
              </h3>
            </div>
            <div className="text-xs">Shows commits linked to this issue.</div>
          </div>
        </aside>

        <div className="[grid-area:BTN] flex justify-end w-full">
          <SubmitButton
            loadingMessage="Submitting..."
            className="w-full md:w-auto"
          >
            Submit new issue
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}

function AssigneeFormInput() {
  return (
    <div className="border-b border-neutral flex flex-col gap-2 text-sm pb-4">
      <button className="flex justify-between items-center group" type="button">
        <h3 className="text-grey font-semibold group-hover:text-accent">
          Assignees
        </h3>
        <GearIcon className="text-grey h-4 w-4 flex-none" />
      </button>
      <div className="text-xs">
        No one -
        <button type="button" className="underline text-grey hover:text-accent">
          Assign yourself
        </button>
      </div>
    </div>
  );
}
function LabelFormInput() {
  return (
    <div className="border-b border-neutral flex flex-col gap-2 text-sm pb-4">
      <button className="flex justify-between items-center group" type="button">
        <h3 className="text-grey font-semibold group-hover:text-accent">
          Labels
        </h3>
        <GearIcon className="text-grey h-4 w-4 flex-none" />
      </button>
      <div className="text-xs">None yet</div>
    </div>
  );
}
