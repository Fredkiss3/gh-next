import * as React from "react";
import { clsx } from "~/lib/shared/utils.shared";

// types
export type MarkdownTitleProps = {
  title: string;
  className?: string;
};

export async function MarkdownTitle({ title, className }: MarkdownTitleProps) {
  const parsed = title.replace(
    /`(.*?)`/g,
    '<code class="rounded-md bg-neutral px-1.5 py-1">$1</code>'
  );

  return (
    <span
      className={clsx("font-normal", className)}
      dangerouslySetInnerHTML={{ __html: parsed }}
    />
  );
}
