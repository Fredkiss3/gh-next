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
        "group relative mb-4 border-b border-neutral pb-2.5",
        "mt-8 scroll-mt-20 first:mt-0",
        "sm:scroll-mt-24",
        {
          "text-4xl font-bold": as === "h1",
          "font-semibold": as !== "h1",
          "text-3xl": as === "h2",
          "text-2xl": as === "h3",
          "text-xl": as === "h4" || as === "h5" || as === "h6"
        }
      )}
      {...props}
    >
      {showLink && (
        <a
          href={`#${props.id}`}
          className={clsx(
            "absolute -left-6 -top-3 opacity-100 transition duration-150",
            "md:opacity-0 md:group-hover:opacity-100"
          )}
        >
          <LinkIcon className="h-5 w-5" />
        </a>
      )}

      {props.children}
    </Tag>
  );
}