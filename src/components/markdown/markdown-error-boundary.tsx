"use client";

import { ErrorBoundary } from "react-error-boundary";

type MarkdownErrorBoundaryProps = {
  children: React.ReactNode;
};

// TODO : render a better error UI
export async function MarkdownErrorBoundary({
  children
}: MarkdownErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={({ error }) => <>Error rendering markdown : {error}</>}
    >
      {children}
    </ErrorBoundary>
  );
}
