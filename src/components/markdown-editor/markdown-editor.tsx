"use client";
import * as React from "react";
// components
import * as Tabs from "@radix-ui/react-tabs";
import { Textarea } from "~/components/textarea";
import { MarkdownIcon } from "@primer/octicons-react";
import { Button } from "~/components/button";
import { MarkdownEditorPreview } from "~/components/markdown-editor/markdown-editor-preview";
import { MarkdownEditorToolbar } from "~/components/markdown-editor/markdown-editor-toolbar";

// utils
import { clsx, isValidURL } from "~/lib/shared/utils.shared";
import { z } from "zod";
import { useTypedParams } from "~/lib/client/hooks/use-typed-params";
import { setFieldText } from "text-field-edit";
import { enableTabToIndent } from "indent-textarea";

// types
import type { TextareaProps } from "~/components/textarea";

export type MarkdownEditorProps = Omit<TextareaProps, "value"> & {
  renderMarkdownAction: (
    content: string,
    repositoryPath: `${string}/${string}`
  ) => Promise<React.JSX.Element>;
};

const TABS = {
  PREVIEW: "PREVIEW",
  EDITOR: "EDITOR"
} as const;
type TabValue = (typeof TABS)[keyof typeof TABS];

const repoParamsSchema = z.object({
  user: z.string(),
  repository: z.string()
});

export function MarkdownEditor({
  label,
  defaultValue,
  renderMarkdownAction,
  ...props
}: MarkdownEditorProps) {
  const params = useTypedParams(
    repoParamsSchema,
    "This component should be used within a user/repository path"
  );

  const [lastSavedTextContent, setLastSavedTextContent] = React.useState(
    defaultValue ?? ""
  );
  const [selectedTab, setSelectedTab] = React.useState<TabValue>(TABS.EDITOR);
  const [textAreaHeight, setTextAreaHeight] = React.useState(0);
  const textAreaRef = React.useRef<React.ElementRef<"textarea"> | null>(null);
  const lastTextareaSelectionRange = React.useRef({ start: -1, end: -1 });

  const renderMarkdown = React.useCallback(
    (content: string) =>
      renderMarkdownAction(content, `${params.user}/${params.repository}`),
    [params.repository, params.user, renderMarkdownAction]
  );
  const [lastRenderPromise, addPromise] = usePromiseRenderMap(
    lastSavedTextContent,
    renderMarkdown
  );

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

  function pasteLinkToTextarea(text: string) {
    const textArea = textAreaRef.current;
    if (textArea && isValidURL(text)) {
      const textContent = textArea.value;
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const isSelectingMultipleChars = selectionEnd - selectionStart > 0;

      if (isSelectingMultipleChars) {
        const untilSelectionStart = textContent.slice(0, selectionStart);
        const fromSelectionEnd = textContent.slice(selectionEnd);
        const selectedText = textContent.slice(selectionStart, selectionEnd);

        const linkText = `[${selectedText}](${text})`;
        const newTextContent =
          untilSelectionStart + linkText + fromSelectionEnd;

        setFieldText(textArea, newTextContent);
        textArea.setSelectionRange(
          selectionStart + linkText.length,
          selectionStart + linkText.length
        );
        return true;
      }
    }
    return false;
  }

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
                const lastTextContent = textAreaRef.current.value.trim();
                setLastSavedTextContent(lastTextContent);
                addPromise(lastTextContent);

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
                  const textContent = textAreaRef.current?.value.trim();
                  if (textContent) {
                    addPromise(textContent);
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
                onTextContentChange={(newValue) => {
                  if (textAreaRef.current) {
                    setFieldText(textAreaRef.current, newValue);
                  }
                }}
              />
            </Tabs.List>

            <div className="p-2 bg-backdrop rounded-b-md">
              <Tabs.Content value={TABS.EDITOR} asChild>
                <Textarea
                  rows={12}
                  {...props}
                  defaultValue={lastSavedTextContent}
                  label={label}
                  onPaste={(ev) => {
                    const isEventHandled = pasteLinkToTextarea(
                      ev.clipboardData.getData("text/plain")
                    );

                    if (isEventHandled) ev.preventDefault();
                  }}
                  className="text-sm"
                  name={selectedTab === "EDITOR" ? props.name : ""}
                  hideLabel
                  ref={(ref) => {
                    textAreaRef.current = ref;
                    if (ref) {
                      enableTabToIndent(ref);
                    }
                  }}
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
                  value={lastSavedTextContent}
                  className="hidden"
                  readOnly
                  name={props.name}
                />

                {lastSavedTextContent.trim().length > 0 && lastRenderPromise ? (
                  <MarkdownEditorPreview renderedMarkdown={lastRenderPromise} />
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

function usePromiseRenderMap(
  content: string,
  renderPromise: (content: string) => Promise<React.JSX.Element>
) {
  const [promiseRenderMap, setPromiseRenderMap] = React.useState<
    Map<string, Promise<React.JSX.Element>>
  >(new Map());
  const lastRenderPromise = promiseRenderMap.get(content) ?? null;

  const addPromise = React.useCallback(
    (newContent: string) => {
      if (!promiseRenderMap.has(newContent)) {
        const newMap = new Map(promiseRenderMap);
        newMap.set(newContent, renderPromise(newContent));
        setPromiseRenderMap(newMap);
      }
    },
    [promiseRenderMap, renderPromise]
  );

  return [lastRenderPromise, addPromise] as const;
}
