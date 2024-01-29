import "server-only";
import { LinkIcon } from "@primer/octicons-react";
import { clsx } from "~/lib/shared/utils.shared";

export type MarkdownHProps = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  showLink: boolean;
} & React.ComponentProps<"h1">;

export function MarkdownH({ as, showLink, ...props }: MarkdownHProps) {
  const Tag = as;
  return (
    <Tag
      className={clsx(
        "inline-flex items-baseline w-full flex-wrap",
        "group relative mb-4 border-b border-neutral pb-2.5",
        "mt-8 scroll-mt-20 first:mt-0",
        "sm:scroll-mt-24",
        {
          "text-3.5xl font-semibold": as === "h1",
          "font-semibold": as !== "h1",
          "text-2xl": as === "h2",
          "text-xl": as === "h3",
          "text-lg": as === "h4" || as === "h5" || as === "h6"
        }
      )}
      {...props}
    >
      {showLink && (
        <a
          href={`#${props.id}`}
          className={clsx(
            "absolute -left-6 -top-1.5 opacity-100 transition duration-150",
            "md:opacity-0 md:group-hover:opacity-100",
            "focus:opacity-100 focus:ring-2 focus:ring-accent focus:outline-none",
            "rounded-md"
          )}
        >
          <LinkIcon className="h-5 w-5" />
        </a>
      )}

      {props.children}
    </Tag>
  );
}
