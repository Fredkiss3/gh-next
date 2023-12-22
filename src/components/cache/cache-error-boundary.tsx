"use client";
import { ErrorBoundary } from "react-error-boundary";

export function CacheErrorBoundary({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => {
        if (typeof window === "undefined") {
          console.error(`Error SSR'ing the cached component :`, error);
        } else {
          console.error(`Error client rendering the cached component :`, error);
        }
        return (
          <div className="flex flex-wrap gap-2">
            <span className="text-xl font-semibold">
              Error rendering the cached component :
            </span>
            <code className="rounded-md bg-neutral text-red-400 px-1.5 py-1">
              {error.toString()}
            </code>
          </div>
        );
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
