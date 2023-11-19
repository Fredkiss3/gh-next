import "./globals.css";
import * as React from "react";

// components
import { TailwindIndicator } from "~/app/(components)/tailwind-indicator";
import { Toaster } from "~/app/(components)/toast/toaster.server";
import NextTopLoader from "nextjs-toploader";
import { IconSwitcher } from "~/app/(components)/icon-switcher";

// utils
import { GeistSans } from "geist/font";
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { Theme } from "~/app/(actions)/theme";
import type { Metadata } from "next";
import type { LayoutProps } from "~/lib/types";

export const metadata: Metadata = {
  title: "gh-next",
  description: "A minimal Github clone built on nextjs app router"
};

export const fetchCache = "default-cache";

export default async function RootLayout({
  children,
  params: { theme }
}: LayoutProps<{ theme: Theme }>) {
  return (
    <html lang="en" suppressHydrationWarning data-theme={theme}>
      <head>
        <link
          rel="alternate icon"
          type="image/png"
          href={theme === "dark" ? `/favicon-dark.png` : `/favicon.png`}
          data-favicon
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={theme === "dark" ? `/favicon-dark.svg` : `/favicon.svg`}
          data-favicon
        />
      </head>
      <body
        className={clsx(GeistSans.className, "bg-backdrop")}
        suppressHydrationWarning
      >
        <IconSwitcher />

        <NextTopLoader showSpinner={false} />
        {children}
        {process.env.NODE_ENV !== "production" && <TailwindIndicator />}

        <React.Suspense fallback={<></>}>
          <Toaster />
        </React.Suspense>
      </body>
    </html>
  );
}
