"use client";
import * as React from "react";
// components
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "~/components/skeleton";
import { RscClientRenderer } from "~/components/custom-rsc-renderer/rsc-client-renderer";

// utils
import { getIssueHoverCard } from "~/actions/issue.action";
import { getMarkdownPreview } from "~/actions/markdown.action";
import { lifetimeCache } from "~/lib/shared/lifetime-cache";

export type MarkdownEditorPreviewProps = {
  repositoryPath: `${string}/${string}`;
  content: string;
};

export function MarkdownEditorPreview(props: MarkdownEditorPreviewProps) {
  // this is so that the action is included in the client manifest of this page and the hovercard
  // in the preview works
  const _ = getIssueHoverCard;
  return (
    <>
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
          {/* <RscClientRenderer
            promise={loadMarkdownJSX(
              loadMarkdownPreview(props.content, props.repositoryPath),
              false
            )}
          /> */}
        </React.Suspense>
      </ErrorBoundary>
    </>
  );
}

// const loadMarkdownPreview = lifetimeCache(getMarkdownPreview);
// // const loadMarkdownJSX = lifetimeCache(renderPayloadOrPromiseToJSX);

// export async function prerenderMarkdownPreview(
//   content: string,
//   repositoryPath: `${string}/${string}`
// ) {
//   React.startTransition(() => {
//     loadMarkdownJSX(loadMarkdownPreview(content, repositoryPath), false);
//   });
// }
