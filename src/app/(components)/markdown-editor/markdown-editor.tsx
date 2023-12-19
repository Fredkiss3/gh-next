"use client";
import * as React from "react";
// components
import * as Tabs from "@radix-ui/react-tabs";
import { Textarea } from "~/app/(components)/textarea";
import { MarkdownIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";

import { MarkdownEditorPreview } from "~/app/(components)/markdown-editor/markdown-editor-preview";
import { MarkdownEditorToolbar } from "~/app/(components)/markdown-editor/markdown-editor-toolbar";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { z } from "zod";
import { useTypedParams } from "~/lib/client/hooks/use-typed-params";
import { flushSync } from "react-dom";
import { prerenderMarkdownPreview } from "~/app/(components)/markdown-editor/markdown-editor-preview";

// types
import type { TextareaProps } from "~/app/(components)/textarea";

export type MarkdownEditorProps = Omit<TextareaProps, "value">;

const TABS = {
  PREVIEW: "PREVIEW",
  EDITOR: "EDITOR"
} as const;
type TabValue = (typeof TABS)[keyof typeof TABS];

const paramsSchema = z.object({
  user: z.string(),
  repository: z.string()
});

export function MarkdownEditor({
  label,
  defaultValue,
  ...props
}: MarkdownEditorProps) {
  const params = useTypedParams(
    paramsSchema,
    "This component should be used within a repository path"
  );

  const [textContent, setTextContent] = React.useState(defaultValue ?? "");
  const [selectedTab, setSelectedTab] = React.useState<TabValue>(TABS.EDITOR);
  const [textAreaHeight, setTextAreaHeight] = React.useState(0);
  const textAreaRef = React.useRef<React.ElementRef<"textarea">>(null);
  const lastTextareaSelectionRange = React.useRef({ start: -1, end: -1 });

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const height = (entry.target as HTMLTextAreaElement).offsetHeight;
      // height becomes 0 when switching tabs
      if (height > 0) {
        setTextAreaHeight(height);
      }
    });

    const textAreaElement = textAreaRef.current;
    if (textAreaElement) {
      setTextAreaHeight(textAreaElement.offsetHeight);
      observer.observe(textAreaElement);

      return () => {
        observer.unobserve(textAreaElement);
      };
    }
  }, [selectedTab]);

  return (
    <>
      <div className="flex flex-col gap-1">
        <p className="font-semibold" aria-hidden="true">
          {label}
          {props.required && <span className="text-danger">*</span>}
        </p>
        <div className={clsx("flex flex-col border border-neutral rounded-md")}>
          <Tabs.Root
            value={selectedTab}
            onValueChange={(tab) => {
              setSelectedTab(tab as TabValue);
              if (textAreaRef.current) {
                lastTextareaSelectionRange.current = {
                  start: textAreaRef.current.selectionStart,
                  end: textAreaRef.current.selectionEnd
                };
              }
            }}
          >
            <Tabs.List className="flex text-sm items-stretch bg-ghost/40">
              <Tabs.Trigger
                value={TABS.EDITOR}
                className={clsx(
                  "px-3 py-2 border-b border-neutral",
                  "aria-[selected=true]:rounded-t-md aria-[selected=true]:border",
                  "aria-[selected=true]:border-b-0 aria-[selected=true]:border-l-0",
                  "aria-[selected=true]:bg-backdrop"
                )}
                onFocus={() => {
                  textAreaRef.current?.focus();
                  const { start, end } = lastTextareaSelectionRange.current;
                  textAreaRef.current?.setSelectionRange(start, end);
                }}
              >
                Write
              </Tabs.Trigger>
              <Tabs.Trigger
                value={TABS.PREVIEW}
                onMouseEnter={() => {
                  if (textContent.trim().length > 0) {
                    prerenderMarkdownPreview(
                      textContent,
                      `${params.user}/${params.repository}`
                    );
                  }
                }}
                className={clsx(
                  "px-3 py-2 border-b border-neutral",
                  "aria-[selected=true]:rounded-t-md aria-[selected=true]:border",
                  "aria-[selected=true]:border-b-0",
                  "aria-[selected=true]:bg-backdrop"
                )}
              >
                Preview
              </Tabs.Trigger>

              <MarkdownEditorToolbar
                showItems={selectedTab === "EDITOR"}
                textAreaRef={textAreaRef}
                textContent={textContent}
                onTextContentChange={(newValue) =>
                  flushSync(() => setTextContent(newValue))
                }
              />
            </Tabs.List>

            <div className="p-2 bg-backdrop rounded-b-md">
              <Tabs.Content value={TABS.EDITOR} asChild>
                <Textarea
                  rows={12}
                  {...props}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  label={label}
                  className="text-sm"
                  name={selectedTab === "EDITOR" ? props.name : ""}
                  hideLabel
                  ref={textAreaRef}
                  style={{
                    height: textAreaHeight > 0 ? `${textAreaHeight}px` : "auto"
                  }}
                />
              </Tabs.Content>
              <Tabs.Content
                value={TABS.PREVIEW}
                style={{
                  minHeight: `${textAreaHeight}px`
                }}
                className="text-sm px-3 py-1 max-w-full overflow-auto min-w-0 data-[state=active]:flex items-stretch justify-stretch"
              >
                {/* 
                  We do this because radix will not show the contents of the tab in DOM if it is not selected, 
                  if we call new `FormData(form)` the content of the textarea won't show
                  whereas we want to submit the contents of the tab regardless of tab selection
                */}
                <textarea
                  value={textContent}
                  className="hidden"
                  readOnly
                  name={props.name}
                />

                {textContent.trim().length > 0 ? (
                  <MarkdownEditorPreview
                    content={textContent}
                    repositoryPath={`${params.user}/${params.repository}`}
                  />
                ) : (
                  <span>Nothing to preview</span>
                )}
              </Tabs.Content>
            </div>
          </Tabs.Root>

          <div className="bg-backdrop rounded-b-md px-2 pb-2">
            <Button
              target="_blank"
              variant="neutral"
              className={clsx(
                "gap-2 items-center text-xs group",
                "transition duration-150"
              )}
              href="https://docs.github.com/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax"
              rel="noreferrer"
              renderLeadingIcon={(cls) => (
                <MarkdownIcon
                  className={clsx(cls, "text-grey group-hover:text-white")}
                />
              )}
            >
              <span>Markdown is suppported</span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
