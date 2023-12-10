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
  KebabHorizontalIcon,
  LinkIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  MarkdownIcon,
  MentionIcon,
  QuoteIcon,
  TasklistIcon
} from "@primer/octicons-react";
import * as Toolbar from "@radix-ui/react-toolbar";
import { Button } from "~/app/(components)/button";
import { Tooltip } from "~/app/(components)/tooltip";
import {
  DropdownContent,
  DropdownItem,
  DropdownRoot,
  DropdownSeparator,
  DropdownTrigger
} from "~/app/(components)/dropdown";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "~/app/(components)/skeleton";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { useParams } from "next/navigation";
import { z } from "zod";
import { getMarkdownPreview } from "~/app/(actions)/markdown.action";
import { getIssueHoverCard } from "~/app/(actions)/issue.action";

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
  const _params = useParams();
  const paramsSchema = z.object({
    user: z.string(),
    repository: z.string()
  });
  const res = paramsSchema.safeParse(_params);
  if (!res.success) {
    throw new Error("This component should be used within a repository path");
  }
  const params = res.data;

  const [textContent, setTextContent] = React.useState(defaultValue ?? "");
  const [selectedTab, setSelectedTab] = React.useState<TabValue>(TABS.EDITOR);
  const [textAreaHeight, setTextAreaHeight] = React.useState(0);
  const textAreaRef = React.useRef<React.ElementRef<"textarea">>(null);

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const height = (entry.target as HTMLTextAreaElement).offsetHeight;
      // height becomes 0 when switching tabs
      if (height > 0) {
        setTextAreaHeight(height);
      }
    });

    const textarea = textAreaRef.current;
    if (textarea) {
      setTextAreaHeight(textarea.offsetHeight);
      observer.observe(textarea);
      return () => {
        observer.unobserve(textarea);
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
            onValueChange={(tab) => setSelectedTab(tab as TabValue)}
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
              >
                Write
              </Tabs.Trigger>
              <Tabs.Trigger
                value={TABS.PREVIEW}
                className={clsx(
                  "px-3 py-2 border-b border-neutral",
                  "aria-[selected=true]:rounded-t-md aria-[selected=true]:border",
                  "aria-[selected=true]:border-b-0",
                  "aria-[selected=true]:bg-backdrop"
                )}
              >
                Preview
              </Tabs.Trigger>

              <Toolbar.Root className="flex w-full border-b border-neutral px-2 py-1 justify-end">
                <ToolbarButton
                  label="Header"
                  onClick={() => {}}
                  icon={HeadingIcon}
                />
                <ToolbarButton
                  label="Bold"
                  onClick={() => {}}
                  icon={BoldIcon}
                />
                <ToolbarButton
                  label="Italic"
                  onClick={() => {}}
                  icon={ItalicIcon}
                />
                <ToolbarButton
                  label="Quote"
                  onClick={() => {}}
                  icon={QuoteIcon}
                />
                <ToolbarButton
                  label="Code"
                  onClick={() => {}}
                  icon={CodeIcon}
                />
                <ToolbarButton
                  label="Link"
                  onClick={() => {}}
                  icon={LinkIcon}
                  className="hidden lg:inline-flex"
                />

                <Toolbar.Separator className="h-4 self-center bg-neutral/40 w-[1px] mx-2 hidden lg:block" />

                <ToolbarButton
                  label="Numbered list"
                  onClick={() => {}}
                  icon={ListOrderedIcon}
                  className="hidden lg:inline-flex"
                />
                <ToolbarButton
                  label="Unordered list"
                  onClick={() => {}}
                  icon={ListUnorderedIcon}
                  className="hidden lg:inline-flex"
                />
                <ToolbarButton
                  label="Task list"
                  onClick={() => {}}
                  icon={TasklistIcon}
                  className="hidden lg:inline-flex"
                />

                <Toolbar.Separator className="h-4 self-center bg-neutral/40 w-[1px] mx-2 hidden lg:block" />

                <ToolbarButton
                  label="Mentions"
                  onClick={() => {}}
                  icon={MentionIcon}
                  className="hidden lg:inline-flex"
                />
                <ToolbarButton
                  label="References"
                  onClick={() => {}}
                  icon={CrossReferenceIcon}
                  className="hidden lg:inline-flex"
                />
                <ToolbarButton
                  label="Slash commands"
                  onClick={() => {}}
                  icon={DiffIgnoredIcon}
                  className="hidden lg:inline-flex"
                />

                <DropdownRoot>
                  <Toolbar.Button asChild>
                    <DropdownTrigger>
                      <Button isSquared variant="neutral" className="lg:hidden">
                        <span className="sr-only">More actions</span>
                        <KebabHorizontalIcon className="h-4 w-4 text-grey" />
                      </Button>
                    </DropdownTrigger>
                  </Toolbar.Button>

                  <DropdownContent align="end">
                    <DropdownItem
                      icon={LinkIcon}
                      text="Link"
                      onClick={() => {}}
                    />
                    <DropdownSeparator />
                    <DropdownItem
                      text="Numbered list"
                      onClick={() => {}}
                      icon={ListOrderedIcon}
                    />
                    <DropdownItem
                      text="Unordered list"
                      onClick={(e) => {}}
                      icon={ListUnorderedIcon}
                    />
                    <DropdownItem
                      text="Task list"
                      onClick={() => {}}
                      icon={TasklistIcon}
                    />
                    <DropdownSeparator />
                    <DropdownItem
                      text="Mentions"
                      onClick={() => {}}
                      icon={MentionIcon}
                    />
                    <DropdownItem
                      text="References"
                      onClick={() => {}}
                      icon={CrossReferenceIcon}
                    />
                    <DropdownItem
                      text="Slash commands"
                      onClick={() => {}}
                      icon={DiffIgnoredIcon}
                    />
                  </DropdownContent>
                </DropdownRoot>
              </Toolbar.Root>
            </Tabs.List>

            <div className="p-2 bg-backdrop rounded-b-md">
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
                {textContent.trim().length > 0 ? (
                  <ErrorBoundary
                    FallbackComponent={({ error }) => (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xl font-semibold">
                          Error rendering preview :
                        </span>
                        <code className="rounded-md bg-neutral text-red-400 px-1.5 py-1">
                          {error.toString()}
                        </code>
                      </div>
                    )}
                  >
                    <React.Suspense
                      fallback={
                        <div className="flex flex-col gap-4 sm:rounded-b-md w-full">
                          <span className="sr-only">loading preview...</span>
                          <Skeleton className="h-8 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="min-h-[4rem] flex-1 w-full" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-4/5" />
                        </div>
                      }
                    >
                      <MarkdownPreviewer
                        content={textContent}
                        repositoryPath={`${params.user}/${params.repository}`}
                      />
                    </React.Suspense>
                  </ErrorBoundary>
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

const loadMarkdownPreview = React.cache(getMarkdownPreview);

export type MarkdownPreviewerProps = {
  repositoryPath: `${string}/${string}`;
  content: string;
};

export function MarkdownPreviewer({
  repositoryPath,
  content
}: MarkdownPreviewerProps) {
  // this is so that the action is included in the client manifest of this page and the hovercard
  // in the preview works
  const _ = getIssueHoverCard;
  return React.use(loadMarkdownPreview(content, repositoryPath));
}

type ToolbarButtonProps = React.ComponentProps<typeof Toolbar.Button> & {
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
};

function ToolbarButton({
  label,
  onClick,
  icon: Icon,
  className,
  ...props
}: ToolbarButtonProps) {
  return (
    <Toolbar.Button {...props} asChild>
      <Tooltip
        content={label}
        side="bottom"
        className="text-xs"
        delayInMs={500}
      >
        <Button
          onClick={onClick}
          isSquared
          variant="neutral"
          className={clsx(className)}
        >
          <span className="sr-only">{label}</span>
          <Icon className="h-4 w-4 text-grey" />
        </Button>
      </Tooltip>
    </Toolbar.Button>
  );
}
