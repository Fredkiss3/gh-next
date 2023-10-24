"use client";
import * as React from "react";

// components
import { HomeIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";

// utils
import { Inter } from "next/font/google";
import { clsx } from "~/lib/shared/utils.shared";

const inter = Inter({ subsets: ["latin"] });

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="charset" content="utf-8" />
        <title>Something went wrong !</title>
      </head>
      <body
        className={clsx(inter.className, "bg-backdrop")}
        suppressHydrationWarning
      >
        <section className="flex h-[80vh] flex-col items-center justify-center gap-4 text-foreground">
          <h1 className="text-4xl font-bold">OOPS ! An error occured</h1>

          <h2 className="text-2xl">
            Please reset the page, if that does not work, reload the page
            instead.
          </h2>

          <Button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 !border-foreground !text-foreground"
            variant="invisible"
          >
            <HomeIcon className="h-4 w-4" />
            Reset the page
          </Button>
        </section>
      </body>
    </html>
  );
}
