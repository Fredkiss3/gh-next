// app/provider.tsx
"use client";
import * as React from "react";
// components
import { RouterProvider } from "react-aria-components";
import { ReactQueryProvider } from "~/app/(components)/react-query-provider";

// utils
import { useRouter } from "next/navigation";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <RouterProvider navigate={router.push}>
      <ReactQueryProvider>{children}</ReactQueryProvider>
    </RouterProvider>
  );
}