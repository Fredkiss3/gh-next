import "server-only";
import * as React from "react";

// components
import { Code } from "bright";
import { MarkdownCodeBlock } from "./markdown-code-block";
import { LinkIcon } from "@primer/octicons-react";
import { MarkdownErrorBoundary } from "~/app/(components)/markdown/markdown-error-boundary";
import Link from "next/link";

// utils
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { clsx } from "~/lib/shared/utils.shared";
import githubDark from "~/lib/server/themes/github-dark.json";
import githubLight from "~/lib/server/themes/github-light.json";
import rehypeRaw from "rehype-raw";
import { compile, run } from "@mdx-js/mdx";
import { VFile } from "vfile";
import { env } from "~/env";

// types
import type { UseMdxComponents } from "@mdx-js/mdx";
type MDXComponents = ReturnType<UseMdxComponents>;
export type MarkdownContentProps = {
  content: string;
  linkHeaders?: boolean;
  className?: string;
  editableCheckboxes?: boolean;
};

function replaceMarkdownMentions(
  input: string,
  // TODO : make this configurable
  repo: string = "vercel/next.js"
) {
  return (
    input
      // Replace commit hash with repo specified with a link
      .replace(
        /\b([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)@([a-f0-9]{7,40})\b/g,
        (_: string, user: string, repo: string, commit: string) =>
          `[${user}/${repo}@${commit.slice(0, 7)}](${
            env.NEXT_PUBLIC_VERCEL_URL
          }/${user}/${repo}/commit/${commit})`
      )
      // Replace commit hash with a link
      .replace(
        /\b([a-f0-9]{7,40})\b/g,
        (commit: string) =>
          `[${commit.slice(0, 7)}](${
            env.NEXT_PUBLIC_VERCEL_URL
          }/${repo}/commit/${commit})`
      )
      // Replace issue or PR number with a link
      .replace(
        /#(\d+)/g,
        (_: string, issue: string) =>
          `[#${issue}](${env.NEXT_PUBLIC_VERCEL_URL}/${repo}/issues/${issue})`
      )
      // Replace 'GH-' issue number with a link
      .replace(
        /GH-(\d+)/g,
        (_: string, issue: string) =>
          `[GH-${issue}](${env.NEXT_PUBLIC_VERCEL_URL}/${repo}/issues/${issue})`
      )
      // Replace GitHub username mention with a link
      .replace(
        /@([a-zA-Z0-9-_]+)/g,
        (_: string, user: string) =>
          `<a data-type="mention" href="${env.NEXT_PUBLIC_VERCEL_URL}/u/${user}"><strong>@${user}</strong></a>`
      )
  );
}

function getComponents(linkHeaders: boolean, editableCheckboxes: boolean) {
  Code.theme = {
    dark: githubDark,
    light: githubLight
  };
  const disallowedTags = {
    title: () => null,
    textarea: () => null,
    style: () => null,
    iframe: () => null,
    embed: () => null,
    script: () => null,
    plaintext: () => null,
    noframes: () => null,
    noembed: () => null,
    xmp: () => null
  } satisfies MDXComponents;

  return {
    h1: (props) => <Header as="h1" showLink={linkHeaders} {...props} />,
    h2: (props) => <Header as="h2" showLink={linkHeaders} {...props} />,
    h3: (props) => <Header as="h3" showLink={linkHeaders} {...props} />,
    h4: (props) => <Header as="h4" showLink={linkHeaders} {...props} />,
    h5: (props) => <Header as="h5" showLink={linkHeaders} {...props} />,
    h6: (props) => <Header as="h6" showLink={linkHeaders} {...props} />,
    ul: (props) => (
      <ul
        {...props}
        className={clsx("text-sm md:text-base", {
          "pl-12": props.className === "contains-task-list",
          "list-disc pl-10": props.className !== "contains-task-list"
        })}
      />
    ),
    ol: (props) => (
      <ol
        {...props}
        className={"list-decimal pl-10 [&_ol]:list-[lower-roman]"}
      />
    ),
    p: (props) => <p {...props} className={"my-4"} />,
    table: (props) => (
      <table
        {...props}
        className="block w-max max-w-full table-auto border-collapse overflow-auto border border-neutral"
      />
    ),
    th: (props) => (
      <th
        {...props}
        className="border border-neutral px-5 py-2 text-left text-lg font-semibold"
      />
    ),
    tr: (props) => <tr {...props} className="even:bg-subtle" />,
    td: (props) => (
      <td {...props} className="border border-neutral px-5 py-2" />
    ),
    li: (props) => (
      <li
        {...props}
        className={clsx({
          "mt-1.5": props.className === "task-list-item",
          "my-2": props.className !== "task-list-item"
        })}
      />
    ),
    hr: (props) => <hr className="h-1 bg-neutral/50 border-0" {...props} />,
    a: (props) => {
      let isExternal = true;
      if (props.href) {
        try {
          const url = new URL(props.href, env.NEXT_PUBLIC_VERCEL_URL);

          const baseURL = new URL(env.NEXT_PUBLIC_VERCEL_URL);
          isExternal = url.hostname !== baseURL.hostname;
        } catch (error) {
          // do nothing
        }
      }

      // @ts-expect-error data-type can be passed to props
      const isMention = props["data-type"] === "mention";

      return isExternal ? (
        <a
          {...props}
          className={clsx("underline", {
            "text-accent": !isMention
          })}
        />
      ) : (
        // @ts-expect-error the types are fiiiiine !
        <Link
          {...props}
          className={clsx("underline", {
            "text-accent": !isMention
          })}
        />
      );
    },
    code: (props) => {
      const lang = props.className?.replace(`language-`, "");
      if (props.children) {
        // single backtick (`) are inline code, so we render them as a simple inline-code
        // they don't contains '\n' and they don't have a lang defined
        if (lang === undefined && !props.children.toString().includes("\n")) {
          return (
            <code className="rounded-md bg-neutral px-1.5 py-1">
              {props.children}
            </code>
          );
        }

        return (
          <MarkdownCodeBlock
            className={clsx("absolute right-2 top-7")}
            codeStr={props.children.toString().trimEnd()}
          >
            <Code
              lang={lang}
              codeClassName="bg-neutral/30 mb-4 rounded-md py-[16px] px-[2px] overflow-auto w-full"
              className="w-full overflow-auto rounded-md p-0"
            >
              {props.children.toString().trimEnd()}
            </Code>
          </MarkdownCodeBlock>
        );
      } else {
        return <></>;
      }
    },
    input: (props) => {
      if (props.type !== "checkbox") {
        return null;
      }
      return (
        <input {...props} type="checkbox" disabled={!editableCheckboxes} />
      );
    },
    ...disallowedTags
  } satisfies MDXComponents;
}

export async function MarkdownContent(props: MarkdownContentProps) {
  return process.env.NODE_ENV === "development" ? (
    <MarkdownRenderer {...props} />
  ) : (
    <MarkdownErrorBoundary>
      <MarkdownRenderer {...props} />
    </MarkdownErrorBoundary>
  );
}

async function MarkdownRenderer({
  content,
  linkHeaders = false,
  className,
  editableCheckboxes = false
}: MarkdownContentProps) {
  console.time("Markdown Rendering");
  const file = await compile(
    new VFile({
      basename: "example.md",
      value: replaceMarkdownMentions(content)
    }),
    {
      jsx: false,
      outputFormat: "function-body",
      rehypePlugins: [
        rehypeRaw,
        // @ts-expect-error
        rehypeSlug
      ],
      remarkPlugins: [remarkGfm],
      format: "md"
    }
  );

  const mod = await run(String(file), {
    Fragment: React.Fragment,
    jsx: React.createElement,
    jsxs: React.createElement
  });

  console.timeEnd("Markdown Rendering");

  return (
    <article className={clsx(className, "break-words leading-normal")}>
      {mod.default({
        components: getComponents(linkHeaders, editableCheckboxes)
      })}
    </article>
  );
}

type HeaderProps = {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  showLink: boolean;
} & React.ComponentProps<"h1">;

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
