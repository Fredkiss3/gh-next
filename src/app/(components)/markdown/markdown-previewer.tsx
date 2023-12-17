"use client";
import * as React from "react";
// components
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "~/app/(components)/skeleton";
import { RscClientRenderer } from "~/app/(components)/custom-rsc-renderer/rsc-client-renderer";

// utils
import { getIssueHoverCard } from "~/app/(actions)/issue.action";
import { getMarkdownPreview } from "~/app/(actions)/markdown.action";

/**
 * Custom `cache` function as `React.cache` doesn't work in the client
 * @param fn
 * @returns
 */
function fnCache<T extends (...args: any[]) => any>(fn: T): T {
  if (typeof window === "undefined") return fn;

  const cache = new Map<string, any>();

  return function cachedFn(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  } as T;
}

const loadMarkdownPreview = fnCache(getMarkdownPreview);

export async function preloadMarkdownPreview(
  content: string,
  repositoryPath: `${string}/${string}`
) {
  await loadMarkdownPreview(content, repositoryPath);
}

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
          <RscClientRenderer
            payloadOrPromise={loadMarkdownPreview(content, repositoryPath)}
          />
        </React.Suspense>
      </ErrorBoundary>
    </>
  );
}
