import { HomeIcon } from "@primer/octicons-react";
import { notFound } from "next/navigation";
import { LinkButton } from "~/app/(components)/linkbutton";

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
    <section className="h-[80vh] flex flex-col gap-4 items-center justify-center text-foreground">
      <h1 className="text-4xl font-bold">This page has not been implemented</h1>

      <h2 className="text-2xl">
        For the sake of this demo, we have not implemented this feature.
      </h2>

      <LinkButton
        href="/"
        className="inline-flex gap-2 items-center !text-foreground !border-foreground"
        variant="invisible"
      >
        <HomeIcon className="h-4 w-4" />
        Go home
      </LinkButton>
    </section>
  );
}
