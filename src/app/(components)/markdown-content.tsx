import "server-only";
import * as React from "react";

// components
import { Code } from "bright";
import { MarkdownCodeBlock } from "./markdown-code-block";
import { LinkIcon } from "@primer/octicons-react";

// utils
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import { clsx } from "~/lib/shared/utils.shared";
import githubDark from "~/lib/server/themes/github-dark.json";
import githubLight from "~/lib/server/themes/github-light.json";

// TODO : INTEGRATE GITHUB REMARK LINKING : https://github.com/remarkjs/remark-github
// import remarkGithub from "remark-github";

// types
export type MarkdownContentProps = {
  content: string;
  linkHeaders?: boolean;
  className?: string;
};

type HTMLHeadingProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>;

export async function MarkdownContent({
  content,
  linkHeaders = false,
  className
}: MarkdownContentProps) {
  Code.theme = {
    dark: githubDark,
    light: githubLight
  };
  console.time("markdown parsing");
  const html = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeReact, {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: {
        h1: (props: HTMLHeadingProps) => (
          <Header as="h1" showLink={linkHeaders} {...props} />
        ),
        h2: (props: HTMLHeadingProps) => (
          <Header as="h2" showLink={linkHeaders} {...props} />
        ),
        h3: (props: HTMLHeadingProps) => (
          <Header as="h3" showLink={linkHeaders} {...props} />
        ),
        h4: (props: HTMLHeadingProps) => (
          <Header as="h4" showLink={linkHeaders} {...props} />
        ),
        h5: (props: HTMLHeadingProps) => (
          <Header as="h5" showLink={linkHeaders} {...props} />
        ),
        h6: (props: HTMLHeadingProps) => (
          <Header as="h6" showLink={linkHeaders} {...props} />
        ),
        ul: (props: any) => (
          <ul
            {...props}
            className={clsx("text-sm md:text-base", {
              "pl-12": props.className === "contains-task-list",
              "list-disc pl-10": props.className !== "contains-task-list"
            })}
          />
        ),
        ol: (props: any) => (
          <ol
            {...props}
            className={"list-decimal pl-10 [&_ol]:list-[lower-roman]"}
          />
        ),
        p: (props: any) => <p {...props} className={"my-4"} />,
        table: (props: any) => (
          <table
            {...props}
            className="block w-max max-w-full table-auto border-collapse overflow-auto border border-neutral"
          />
        ),
        th: (props: any) => (
          <th
            {...props}
            className="border border-neutral px-5 py-2 text-left text-lg font-semibold"
          />
        ),
        tr: (props: any) => <tr {...props} className="even:bg-subtle" />,
        td: (props: any) => (
          <td {...props} className="border border-neutral px-5 py-2" />
        ),
        li: (props: any) => (
          <li
            {...props}
            className={clsx({
              "mt-1.5": props.className === "task-list-item",
              "my-2": props.className !== "task-list-item"
            })}
          />
        ),
        input: (props: any) => (
          <input
            {...props}
            className={clsx({
              "-ml-8 mb-1 mr-0.5 mt-0 align-middle": props.type === "checkbox"
            })}
          />
        ),
        a: (props: any) => <a className="text-accent" {...props} />,
        code: (
          props:
            | ({ className?: string; children?: React.ReactNode } & Record<
                string,
                any
              >)
            | undefined
        ) => {
          const lang = props?.className?.replace(`language-`, "");
          if (props?.children) {
            let children = "";
            // Children will always be an array with a single string, but for typescript,
            // we check anyway
            if (Array.isArray(props.children)) {
              children = props.children[0];
            }

            // single backtick (`) are inline code, so we render them as a simple inline-code
            // they don't end with '\n'
            if (lang === undefined && !children.endsWith("\n")) {
              return (
                <code className="rounded-md bg-neutral/50 px-1.5 py-1">
                  {children}
                </code>
              );
            }

            return (
              <MarkdownCodeBlock
                className={clsx("absolute right-2 top-7")}
                codeStr={children.trim()}
              >
                <Code
                  lang={lang}
                  codeClassName="bg-neutral/50 mb-4 rounded-md py-[16px] px-[2px] overflow-auto w-full"
                  className="w-full overflow-auto rounded-md p-0"
                >
                  {children.trim()}
                </Code>
              </MarkdownCodeBlock>
            );
          } else {
            return <></>;
          }
        }
      }
    })
    .process(content);

  console.timeEnd("markdown parsing");

  return (
    <article className={clsx(className, "break-words leading-normal")}>
      {html.result}
    </article>
  );
}

type HeaderProps = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  showLink: boolean;
} & HTMLHeadingProps;

function Header({ as, showLink, ...props }: HeaderProps) {
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
