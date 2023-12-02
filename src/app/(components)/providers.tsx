// app/provider.tsx
"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { RouterProvider } from "react-aria-components";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return <RouterProvider navigate={router.push}>{children}</RouterProvider>;
}
