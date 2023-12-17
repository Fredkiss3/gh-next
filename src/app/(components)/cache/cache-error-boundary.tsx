"use client";
import { ErrorBoundary } from "react-error-boundary";

export function CacheErrorBoundary({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => {
        if (typeof window === "undefined") {
          console.error(`Error SSR'ing the cached component :`, error);
        } else {
          console.error(`Error client rendering the cached component :`, error);
        }
        return fallback;
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
