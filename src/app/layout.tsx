import "./globals.css";

// components
import { TailwindIndicator } from "~/app/(components)/tailwind-indicator";
import { Toaster } from "~/app/(components)/toast/toaster.server";

// utils
import { Inter } from "next/font/google";
import { getTheme } from "~/app/(actions)/theme";
import { clsx } from "~/lib/shared-utils";

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

export const runtime = "edge";
export const revalidate = 0;
export const fetchCache = "default-cache";
export const preferredRegion = "fra1";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-theme={await getTheme()}>
      <body
        className={clsx(inter.className, "bg-backdrop")}
        suppressHydrationWarning
      >
        {children}
        {process.env.NODE_ENV !== "production" && <TailwindIndicator />}

        <Toaster />
      </body>
    </html>
  );
}