"use server";

import { Markdown } from "~/app/(components)/markdown/markdown";

export async function getMarkdownPreview(
  content: string,
  repositoryPath: `${string}/${string}`
) {
  return <Markdown content={content} repository={repositoryPath} />;
}
