import "server-only";
import * as React from "react";

// components
import { Code } from "bright";
import { MarkdownCodeBlock } from "./markdown-code-block";
import { MarkdownErrorBoundary } from "~/app/(components)/markdown/markdown-error-boundary";
import {
  MarkdownA,
  type BuildUrlValues,
  type ResolvedItems
} from "~/app/(components)/markdown/markdown-a";
import { MarkdownH } from "~/app/(components)/markdown/markdown-h";

// utils
import remarkGfm from "remark-gfm";
import remarkGithub, { type BuildUrlIssueValues } from "remark-github";
import rehypeSlug from "rehype-slug";
import { clsx } from "~/lib/shared/utils.shared";
import githubDark from "~/lib/server/themes/github-dark.json";
import githubLight from "~/lib/server/themes/github-light.json";
import rehypeRaw from "rehype-raw";
import { compile, run } from "@mdx-js/mdx";
import { env } from "~/env";
import { getAuthedUser } from "~/app/(actions)/auth";
import {
  getMultipleIssuesPerRepositories,
  type IssueQueryResult
} from "~/app/(models)/issues";
import { VFile } from "vfile";
import { remark } from "remark";

// types
import type { UseMdxComponents } from "@mdx-js/mdx";
import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME
} from "~/lib/shared/constants";
import type { User } from "~/lib/server/db/schema/user.sql";
import {
  getMultipleUserByUsername,
  type UserQueryResult
} from "~/app/(models)/user";

export type MDXComponents = ReturnType<UseMdxComponents>;
export type ResolvedIssues = Record<
  number,
  Awaited<ReturnType<typeof getMultipleIssuesPerRepositories>>[number]
>;

export type MarkdownContentProps = {
  content: string;
  linkHeaders?: boolean;
  className?: string;
  editableCheckboxes?: boolean;
  repository?: string;
};

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
  editableCheckboxes = false,
  repository = `${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`
}: MarkdownContentProps) {
  const dt = new Date().getTime();
  console.time(`[${dt}] Markdown Rendering`);

  let resolvedItems: BuildUrlValues[] = [];

  // preprocess links & mentions
  const preprocessed = await remark()
    .use(remarkGfm)
    .use(remarkGithub, {
      repository,
      mentionStrong: false,
      baseURL: "gh.fredkiss.dev",
      buildUrl: (values) => {
        const searchParams = new URLSearchParams(values);
        switch (values.type) {
          case "commit":
            resolvedItems.push(values);
            return `${env.NEXT_PUBLIC_VERCEL_URL}/${values.user}/${
              values.project
            }/commit/${values.hash}?${searchParams.toString()}`;
          case "issue":
            resolvedItems.push(values);
            return `${env.NEXT_PUBLIC_VERCEL_URL}/${values.user}/${
              values.project
            }/issues/${values.no}?${searchParams.toString()}`;
          case "mention":
            resolvedItems.push(values);
            return `${env.NEXT_PUBLIC_VERCEL_URL}/u/${
              values.user
            }?${searchParams.toString()}`;
          default:
            return false;
        }
      }
    })
    .process(
      new VFile({
        basename: "example.md",
        value: content
      })
    );

  const file = await compile(preprocessed, {
    jsx: false,
    outputFormat: "function-body",
    rehypePlugins: [
      rehypeRaw,
      // @ts-expect-error
      rehypeSlug
    ],
    remarkPlugins: [remarkGfm],
    format: "md"
  });

  const mod = await run(String(file), {
    Fragment: React.Fragment,
    jsx: React.createElement,
    jsxs: React.createElement
  });

  const authedUser = await getAuthedUser();

  const issueNumbers = resolvedItems.filter(
    (item) => item.type === "issue"
  ) as BuildUrlIssueValues[];

  const userMentions = resolvedItems
    .map((val) => (val.type === "mention" ? val.user : null))
    .filter((item) => item !== null) as string[];

  const resolvedIssues = await getMultipleIssuesPerRepositories(
    issueNumbers,
    authedUser
  );
  const resolvedMentions = await getMultipleUserByUsername(userMentions);

  console.timeEnd(`[${dt}] Markdown Rendering`);

  return (
    <article
      className={clsx(className, "break-words leading-normal text-base")}
    >
      {mod.default({
        components: await getComponents({
          linkHeaders,
          editableCheckboxes,
          authedUser,
          currentRepo: repository,
          resolvedItems: {
            issues: resolvedIssues.reduce(
              (acc, issue) => {
                acc[issue.number] = issue;
                return acc;
              },
              {} as Record<number, IssueQueryResult>
            ),
            mentions: resolvedMentions.reduce(
              (acc, user) => {
                acc[user.username.toLowerCase()] = user;
                return acc;
              },
              {} as Record<string, UserQueryResult>
            )
          }
        })
      })}
    </article>
  );
}

async function getComponents({
  linkHeaders,
  editableCheckboxes,
  resolvedItems,
  authedUser,
  currentRepo
}: {
  linkHeaders: boolean;
  editableCheckboxes: boolean;
  resolvedItems: ResolvedItems;
  authedUser: User | null;
  currentRepo: string;
}) {
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

  let noOfKeys = 0;

  return {
    h1: (props) => <MarkdownH as="h1" showLink={linkHeaders} {...props} />,
    h2: (props) => <MarkdownH as="h2" showLink={linkHeaders} {...props} />,
    h3: (props) => <MarkdownH as="h3" showLink={linkHeaders} {...props} />,
    h4: (props) => <MarkdownH as="h4" showLink={linkHeaders} {...props} />,
    h5: (props) => <MarkdownH as="h5" showLink={linkHeaders} {...props} />,
    h6: (props) => <MarkdownH as="h6" showLink={linkHeaders} {...props} />,
    ul: (props) => {
      const key = ++noOfKeys;
      return (
        <ul
          {...props}
          key={key}
          className={clsx("text-sm md:text-base", {
            "pl-12": props.className === "contains-task-list",
            "list-disc pl-10": props.className !== "contains-task-list"
          })}
        />
      );
    },
    ol: (props) => {
      const key = ++noOfKeys;
      return (
        <ol
          {...props}
          key={key}
          className={"list-decimal pl-10 [&_ol]:list-[lower-roman]"}
        />
      );
    },
    p: (props) => {
      const key = ++noOfKeys;
      return <p {...props} key={key} className={"my-4"} />;
    },
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
    li: (props) => {
      const key = ++noOfKeys;
      return (
        <li
          {...props}
          key={key}
          className={clsx("text-base", {
            "mt-1.5": props.className === "task-list-item",
            "my-2": props.className !== "task-list-item"
          })}
        />
      );
    },
    hr: (props) => <hr className="h-1 bg-neutral/50 border-0" {...props} />,
    a: (props) => {
      const key = ++noOfKeys;
      return (
        <MarkdownA
          key={key}
          currentRepo={currentRepo}
          resolvedItems={resolvedItems}
          authedUser={authedUser}
          {...props}
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
              codeClassName="bg-neutral/30 rounded-md py-[16px] px-[2px] overflow-auto w-full"
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
    // eslint-disable-next-line @next/next/no-img-element
    img: (props) => <img {...props} loading="lazy" alt={props.alt ?? ""} />,
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
