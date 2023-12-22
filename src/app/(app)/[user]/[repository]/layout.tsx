import type { Metadata } from "next";
import * as React from "react";
import { getRepositoryByOwnerAndName } from "~/models/repository";
import type { LayoutProps, PageProps } from "~/lib/types";

export async function generateMetadata(
  props: LayoutProps<{
    user: string;
    repository: string;
  }>
): Promise<Metadata> {
  const repository = await getRepositoryByOwnerAndName(
    props.params.user,
    props.params.repository
  );

  if (!repository) {
    return {
      title: "Not-Found"
    };
  }

  return {
    title: {
      template: `%s · ${repository.owner.username}/${repository.name}`,
      default: `${repository.owner.username}/${repository.name} · ${repository.description}`
    }
  };
}

export default function RepositoryLayout({
  children
}: LayoutProps<{
  user: string;
  repository: string;
}>) {
  return children;
}
