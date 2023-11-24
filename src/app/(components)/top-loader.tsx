"use client";
import * as React from "react";
import * as NProgress from "nprogress";
import NextTopLoader from "nextjs-toploader";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function TopLoader() {
  return (
    <>
      <NextTopLoader showSpinner={false} />
      <FinishingLoader />
    </>
  );
}

function FinishingLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  React.useEffect(() => {
    NProgress.done();
  }, [pathname, router, searchParams]);
  return null;
}
