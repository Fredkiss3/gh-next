"use client";
import * as React from "react";
// components
import * as Tabs from "@radix-ui/react-tabs";
import { Textarea } from "~/app/(components)/textarea";
import {
  BoldIcon,
  CodeIcon,
  CrossReferenceIcon,
  DiffIgnoredIcon,
  HeadingIcon,
  ItalicIcon,
  LinkIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  MarkdownIcon,
  MentionIcon,
  QuoteIcon,
  TasklistIcon
} from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";
import {
  ActionToolbar,
  type ActionToolbarItemGroups
} from "~/app/(components)/action-toolbar";
import {
  MarkdownPreviewer,
  preloadMarkdownPreview
} from "~/app/(components)/markdown/markdown-previewer";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { z } from "zod";
import { useTypedParams } from "~/lib/client/hooks/use-typed-params";
import { flushSync } from "react-dom";

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
                    preloadMarkdownPreview(
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

              <MarkdownTextAreaToolbar
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
                className="text-sm p-4 max-w-full overflow-auto min-w-0 data-[state=active]:flex items-stretch justify-stretch"
              >
                {/* 
                  We do this because radix will not show the contents of the tab in DOM if it is not selected, 
                  whereas we want to submit the contents of the tab regardless of tab selection
                */}
                <textarea
                  value={textContent}
                  className="hidden"
                  readOnly
                  name={props.name}
                />

                {textContent.trim().length > 0 ? (
                  <MarkdownPreviewer
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

type MarkdownTextAreaToolbarProps = {
  textAreaRef: React.RefObject<React.ElementRef<"textarea">>;
  onTextContentChange: (newText: string) => void;
  textContent: string;
  showItems?: boolean;
};

function getSelectionStartAndSelectionEnd(
  text: string,
  cursorPosition: number
) {
  const nextWord = text.slice(cursorPosition).split(/[ \n]/)[0];
  const previousWord = text
    .slice(0, cursorPosition)
    .split(/[ \n]/)
    .reverse()[0];

  const start = cursorPosition - previousWord.length;
  const end = cursorPosition + nextWord.length;

  return { start, end };
}

type SurroundTextWithArgs = {
  text: string;
  startIndex: number;
  endIndex: number;
  beforeText: string;
  afterText?: string;
};

function surroundTextWith({
  text,
  startIndex,
  endIndex,
  beforeText,
  afterText = beforeText
}: SurroundTextWithArgs) {
  const untilSelectionStart = text.slice(0, startIndex);
  const fromSelectionEnd = text.slice(endIndex);
  const selectedContent = text.slice(startIndex, endIndex);

  return (
    untilSelectionStart +
    beforeText +
    selectedContent +
    afterText +
    fromSelectionEnd
  );
}

type StripSurroundTextWithArgs = {
  text: string;
  startIndex: number;
  endIndex: number;
  surroundingText: string;
};

function stripSurroundingText({
  text,
  startIndex,
  endIndex,
  surroundingText
}: StripSurroundTextWithArgs) {
  const untilSelectionStart = text.slice(0, startIndex);
  const fromSelectionEnd = text.slice(endIndex);
  const selectedContent = text.slice(startIndex, endIndex);

  return (
    untilSelectionStart +
    selectedContent.slice(
      surroundingText.length,
      selectedContent.length - surroundingText.length
    ) +
    fromSelectionEnd
  );
}

const MarkdownTextAreaToolbar = React.forwardRef<
  React.ElementRef<typeof ActionToolbar>,
  MarkdownTextAreaToolbarProps
>(function MarkdownTextAreaToolbar(
  { textAreaRef, onTextContentChange, textContent, showItems = true },
  ref
) {
  function addHeading() {
    const textArea = textAreaRef.current;
    if (textArea) {
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const untilSelectionStart = textContent.slice(0, selectionStart);
      const fromSelectionStart = textContent.slice(selectionStart);

      onTextContentChange(untilSelectionStart + "### " + fromSelectionStart);
      textArea.setSelectionRange(selectionStart + 4, selectionEnd + 4);
      textArea.focus();
    }
  }

  function addOrRemoveSurroundingChars(chars: string) {
    const textArea = textAreaRef.current;
    if (textArea) {
      const selectionStart = textArea.selectionStart;
      const selectionEnd = textArea.selectionEnd;

      const isSelectingMultipleChars = selectionEnd - selectionStart > 0;

      if (isSelectingMultipleChars) {
        const selectedContentBolded = textContent.slice(
          selectionStart - chars.length,
          selectionEnd + chars.length
        );

        const isTextAlreadyBolded =
          selectedContentBolded.startsWith(chars) &&
          selectedContentBolded.endsWith(chars);

        if (isTextAlreadyBolded) {
          onTextContentChange(
            stripSurroundingText({
              text: textContent,
              startIndex: selectionStart - chars.length,
              endIndex: selectionEnd + chars.length,
              surroundingText: chars
            })
          );
          // keep the selection considering the bold stars removed
          textArea.setSelectionRange(
            selectionStart - chars.length,
            selectionEnd - chars.length
          );
        } else {
          onTextContentChange(
            surroundTextWith({
              text: textContent,
              startIndex: selectionStart,
              endIndex: selectionEnd,
              beforeText: chars
            })
          );
          // keep the selection considering the bold stars added
          textArea.setSelectionRange(
            selectionStart + chars.length,
            selectionEnd + chars.length
          );
        }
      } else {
        const { start, end } = getSelectionStartAndSelectionEnd(
          textContent,
          selectionEnd
        );

        const selectedContent = textContent.slice(start, end);
        const isTextAlreadyBolded =
          selectedContent.startsWith(chars) && selectedContent.endsWith(chars);

        if (isTextAlreadyBolded) {
          onTextContentChange(
            stripSurroundingText({
              text: textContent,
              startIndex: start,
              endIndex: end,
              surroundingText: chars
            })
          );

          // keep the selection considering the bold stars removed
          textArea.setSelectionRange(
            selectionEnd - chars.length,
            selectionEnd - chars.length
          );
        } else {
          onTextContentChange(
            surroundTextWith({
              text: textContent,
              startIndex: start,
              endIndex: end,
              beforeText: chars
            })
          );

          // keep the selection considering the bold stars added
          textArea.setSelectionRange(
            selectionEnd + chars.length,
            selectionEnd + chars.length
          );
        }
      }
      textArea.focus();
    }
  }

  const itemGroups = [
    [
      {
        id: "header",
        label: "Header",
        icon: HeadingIcon,
        onClick: addHeading
      },
      {
        id: "bold",
        label: "Bold",
        onClick: () => addOrRemoveSurroundingChars("**"),
        icon: BoldIcon
      },
      {
        id: "italic",
        label: "Italic",
        onClick: () => addOrRemoveSurroundingChars("_"),
        icon: ItalicIcon
      },
      {
        id: "quote",
        label: "Quote",
        onClick: () => {},
        icon: QuoteIcon
      },
      {
        id: "code",
        label: "Code",
        onClick: () => addOrRemoveSurroundingChars("`"),
        icon: CodeIcon
      },
      {
        id: "link",
        label: "Link",
        onClick: () => {},
        icon: LinkIcon
      }
    ],
    [
      {
        id: "ordered-list",
        label: "Numbered list",
        onClick: () => {},
        icon: ListOrderedIcon
      },
      {
        id: "unordered-list",
        label: "Unordered list",
        onClick: () => {},
        icon: ListUnorderedIcon
      },
      {
        id: "task-list",
        label: "Task list",
        onClick: () => {},
        icon: TasklistIcon
      }
    ],
    [
      {
        id: "mentions",
        label: "Mentions",
        onClick: () => {},
        icon: MentionIcon
      },
      {
        id: "references",
        label: "References",
        onClick: () => {},
        icon: CrossReferenceIcon
      },
      {
        id: "commands",
        label: "Slash commands",
        onClick: () => {},
        icon: DiffIgnoredIcon
      }
    ]
  ] satisfies Array<ActionToolbarItemGroups>;

  return (
    <ActionToolbar
      ref={ref}
      title="Formatting options"
      className="border-b border-neutral"
      itemGroups={itemGroups}
      showItems={showItems}
    />
  );
});
