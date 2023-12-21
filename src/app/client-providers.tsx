// app/provider.tsx
"use client";
import * as React from "react";
// components
import { ReactQueryProvider } from "~/components/react-query-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return <ReactQueryProvider>{children}</ReactQueryProvider>;
}
