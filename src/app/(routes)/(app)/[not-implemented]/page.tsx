// components
import { HomeIcon } from "@primer/octicons-react";
import { Button } from "~/app/(components)/button";

// utils
import { notFound } from "next/navigation";
import { clsx } from "~/lib/functions";

// types
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not implemented",
};

export default function Page({
  params: { "not-implemented": path },
}: {
  params: { "not-implemented": string };
}) {
  const validPaths = [
    "pulls",
    "security",
    "pulse",
    "discussions",
    "actions",
    "settings",
  ];

  if (!validPaths.includes(path)) {
    notFound();
  }

  return (
    <section
      className={clsx(
        "flex flex-col gap-4 items-center justify-center",
        "px-5 h-[80vh] text-foreground text-center",
        "md:px-8"
      )}
    >
      <h1 className="text-4xl font-bold">This page has not been implemented</h1>

      <h2 className="text-2xl">
        For the sake of this demo, we have not implemented this feature.
      </h2>

      <Button
        href="/"
        className="inline-flex gap-2 items-center !text-foreground !border-foreground"
        variant="invisible"
      >
        <HomeIcon className="h-4 w-4" />
        Go home
      </Button>
    </section>
  );
}
