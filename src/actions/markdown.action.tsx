"use server";

import { Markdown } from "~/components/markdown/markdown";
import { renderRSCtoString } from "~/components/custom-rsc-renderer/render-rsc-to-string";

export async function getMarkdownPreview(
  content: string,
  repositoryPath: `${string}/${string}`
) {
  return await renderRSCtoString(
    <Markdown content={content} repository={repositoryPath} />
  );
}
