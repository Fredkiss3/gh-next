import * as React from "react";
import { Code } from "bright";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeReact from "rehype-react";
import rehypeSlug from "rehype-slug";
import { CopyCodeButton } from "./copy-code-button";
import { clsx } from "~/lib/functions";
import { LinkIcon } from "@primer/octicons-react";

// TODO : INTEGRATE GITHUB REMARK LINKING : https://github.com/remarkjs/remark-github
import remarkGithub from "remark-github";
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
  className,
}: MarkdownContentProps) {
  Code.theme = {
    dark: "github-dark",
    light: "github-light",
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
              "pl-10 list-disc": props.className !== "contains-task-list",
            })}
          />
        ),
        ol: (props: any) => (
          <ol
            {...props}
            className={"pl-10 list-decimal [&_ol]:list-[lower-roman]"}
          />
        ),
        p: (props: any) => <p {...props} className={"my-4"} />,
        // FIXME: MAKE IT WORK WITH TABLES : https://github.com/remarkjs/remark-gfm/blob/main/readme.md#example-singletilde
        table: (props: any) => (
          <table
            {...props}
            className={
              "table-auto border border-neutral mb-8 text-center w-[max-content] max-w-full border-collapse"
            }
          />
        ),
        td: (props: any) => (
          <table {...props} className={"border border-neutral x-6 py-3"} />
        ),
        th: (props: any) => <table {...props} className={"px-6 py-3"} />,

        li: (props: any) => (
          <li
            {...props}
            className={clsx({
              "mt-1.5": props.className === "task-list-item",
              "my-2": props.className !== "task-list-item",
            })}
          />
        ),
        input: (props: any) => (
          <input
            {...props}
            className={clsx({
              "mb-1 mr-0.5 -ml-8 mt-0 align-middle": props.type === "checkbox",
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
                <code className="bg-neutral/50 rounded-md px-1.5 py-1">
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group">
                <Code
                  lang={lang}
                  codeClassName="bg-neutral/50 mb-4 rounded-md py-[16px] px-[2px] overflow-auto w-full"
                  className="p-0 overflow-auto w-full rounded-md"
                >
                  {children.trim()}
                </Code>

                <CopyCodeButton
                  className={clsx(
                    "transition duration-150 opacity-0 group-hover:opacity-100",
                    "absolute right-2 top-6"
                  )}
                  code={children.trim()}
                />
              </div>
            );
          } else {
            return <></>;
          }
        },
      },
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
        "border-b border-neutral pb-2.5 mb-4 relative group",
        "scroll-mt-20 mt-8 first:mt-0",
        "sm:scroll-mt-24",
        {
          "font-bold text-4xl": as === "h1",
          "font-semibold": as !== "h1",
          "text-3xl": as === "h2",
          "text-2xl": as === "h3",
          "text-xl": as === "h4",
          "text-xl ": as === "h5",
          "text-xl  ": as === "h6",
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
