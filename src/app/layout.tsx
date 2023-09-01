import "./globals.css";
import * as React from "react";

// components
import { TailwindIndicator } from "~/app/(components)/tailwind-indicator";
import { Toaster } from "~/app/(components)/toast/toaster.server";
import NextTopLoader from "nextjs-toploader";
import { IconSwitcher } from "~/app/(components)/icon-switcher";

// utils
import { Inter } from "next/font/google";
import { getTheme } from "~/app/(actions)/theme";
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s - Fredkiss3/gh-next",
    default:
      "Fredkiss3/gh-next - A minimal Github clone built on nextjs app router",
  },
  description: "This is an issue management app",
};

export const revalidate = 0;
export const fetchCache = "default-cache";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = await getTheme();
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
        className={clsx(inter.className, "bg-backdrop")}
        suppressHydrationWarning
      >
        <IconSwitcher />

        <NextTopLoader showSpinner={false} />
        {children}
        {process.env.NODE_ENV !== "production" && <TailwindIndicator />}

        <Toaster />
      </body>
    </html>
  );
}
