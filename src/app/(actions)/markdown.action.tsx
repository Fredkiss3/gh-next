"use server";

import { Markdown } from "~/app/(components)/markdown/markdown";

export function renderMarkdown(
  content: string,
  repositoryPath: `${string}/${string}`
) {
  return <Markdown content={content} repository={repositoryPath} />;
}
