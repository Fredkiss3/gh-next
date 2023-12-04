"use client";
import * as React from "react";
// components
import * as Tabs from "@radix-ui/react-tabs";
import { Textarea } from "~/app/(components)/textarea";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { TextareaProps } from "~/app/(components)/textarea";
export type MarkdownTextAreaProps = Omit<TextareaProps, "value">;

const TABS = {
  PREVIEW: "PREVIEW",
  EDITOR: "EDITOR"
} as const;
type TabValue = (typeof TABS)[keyof typeof TABS];

export function MarkdownTextArea({
  label,
  defaultValue,
  ...props
}: MarkdownTextAreaProps) {
  const [textContent, setTextContent] = React.useState(defaultValue);
  const [selectedTab, setSelectedTab] = React.useState<TabValue>(TABS.EDITOR);

  return (
    <div className="flex flex-col gap-1">
      <p className="font-semibold" aria-hidden="true">
        {label}
        {props.required && <span className="text-danger">*</span>}
      </p>
      <div className={clsx("flex flex-col border border-neutral rounded-md")}>
        <Tabs.Root
          value={selectedTab}
          onValueChange={(tab) => setSelectedTab(tab as TabValue)}
        >
          <Tabs.List className="flex text-sm items-stretch bg-ghost/40">
            <Tabs.Trigger
              value={TABS.EDITOR}
              className={clsx(
                "px-4 py-2 border-b border-neutral",
                "aria-[selected=true]:rounded-t-md aria-[selected=true]:border",
                "aria-[selected=true]:border-b-0 aria-[selected=true]:border-l-0",
                "aria-[selected=true]:bg-background"
              )}
            >
              Write
            </Tabs.Trigger>
            <Tabs.Trigger
              value={TABS.PREVIEW}
              className={clsx(
                "px-4 py-2 border-b border-neutral",
                "aria-[selected=true]:rounded-t-md aria-[selected=true]:border",
                "aria-[selected=true]:border-b-0",
                "aria-[selected=true]:bg-background"
              )}
            >
              Preview
            </Tabs.Trigger>
          </Tabs.List>

          <div className="p-2 bg-background rounded-b-md">
            {/* 
              We do this because radix will not show the contents of the tab in DOM if it is not selected, 
              whereas we want to submit the contents of the tab regardless of tab selection
            */}
            {selectedTab !== "EDITOR" && (
              <textarea
                value={textContent}
                className="hidden"
                readOnly
                name={props.name}
              />
            )}

            <Tabs.Content value={TABS.EDITOR}>
              <Textarea
                rows={12}
                {...props}
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                label={label}
                className="text-sm"
                name={selectedTab === "EDITOR" ? props.name : ""}
                hideLabel
              />
            </Tabs.Content>
            <Tabs.Content value={TABS.PREVIEW}>Preview</Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
}
