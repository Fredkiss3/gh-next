// components
import { HomeIcon } from "@primer/octicons-react";
import { Button } from "~/components/button";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { Metadata } from "next";
import type { PageProps } from "~/lib/types";

export const metadata: Metadata = {
  title: "Actions"
};

export default function ActionPage(
  props: PageProps<{ user: string; repository: string }>
) {
  return (
    <section
      className={clsx(
        "flex flex-col items-center justify-center gap-4",
        "h-[80vh] px-5 text-center text-foreground",
        "md:px-8"
      )}
    >
      <h1 className="text-4xl font-bold">
        This page has not been implemented yet
      </h1>

      <h2 className="text-2xl">Come back later when we implement this.</h2>

      <Button
        href="/"
        className="inline-flex items-center gap-2 !border-foreground !text-foreground"
        variant="invisible"
      >
        <HomeIcon className="h-4 w-4" />
        Go home
      </Button>
    </section>
  );
}
