import "server-only";
import * as React from "react";

// components
import { Code } from "bright";
import { MarkdownCodeBlock } from "./markdown-code-block";
import { MarkdownErrorBoundary } from "~/app/(components)/markdown/markdown-error-boundary";
import {
  MarkdownA,
  type IssueReference,
  type Reference,
  type ResolvedReferences
} from "~/app/(components)/markdown/markdown-a";
import { MarkdownH } from "~/app/(components)/markdown/markdown-h";
import {
  DeviceCameraVideoIcon,
  TriangleDownIcon
} from "@primer/octicons-react";
import { MarkdownSkeleton } from "~/app/(components)/markdown/markdown-skeleton";

// utils
import remarkGfm from "remark-gfm";
import remarkGithub from "remark-github";
import rehypeSlug from "rehype-slug";
import { clsx } from "~/lib/shared/utils.shared";
import githubDark from "~/lib/server/themes/github-dark.json";
import githubLight from "~/lib/server/themes/github-light.json";
import rehypeRaw from "rehype-raw";
import { compile, run } from "@mdx-js/mdx";
import { env } from "~/env";
import { getAuthedUser } from "~/app/(actions)/auth";
import { getMultipleIssuesPerRepositories } from "~/app/(models)/issues";
import { VFile } from "vfile";
import { remark } from "remark";
import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME,
  PRODUCTION_DOMAIN
} from "~/lib/shared/constants";
import { getMultipleUserByUsername } from "~/app/(models)/user";

// types
import type { UseMdxComponents } from "@mdx-js/mdx";
import type { User } from "~/lib/server/db/schema/user.sql";
import type { IssueQueryResult } from "~/app/(models)/issues";
import type { UserQueryResult } from "~/app/(models)/user";

export type MDXComponents = ReturnType<UseMdxComponents>;

export type MarkdownProps = {
  content: string;
  linkHeaders?: boolean;
  className?: string;
  editableCheckboxes?: boolean;
  repository?: string;
};

export async function Markdown(props: MarkdownProps) {
  return (
    <React.Suspense fallback={<MarkdownSkeleton className={props.className} />}>
      {process.env.NODE_ENV === "development" ? (
        <MarkdownContent {...props} />
      ) : (
        <MarkdownErrorBoundary>
          <MarkdownContent {...props} />
        </MarkdownErrorBoundary>
      )}
    </React.Suspense>
  );
}

async function MarkdownContent({
  content,
  className,
  linkHeaders = false,
  editableCheckboxes = false,
  repository = `${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}`
}: MarkdownProps) {
  const dt = new Date().getTime();
  console.time(`[${dt}] Markdown Rendering`);

  const { processedContent, references } =
    await processMarkdownContentAndGetReferences(content, repository);
  const authedUser = await getAuthedUser();
  const resolvedReferences = await resolveReferences(references, authedUser);

  const generatedMdxModule = await run(processedContent, {
    Fragment: React.Fragment,
    jsx: React.createElement,
    jsxs: React.createElement
  });

  console.timeEnd(`[${dt}] Markdown Rendering`);

  return (
    <article
      className={clsx(className, "break-words leading-normal text-base")}
    >
      {generatedMdxModule.default({
        components: await getComponents({
          linkHeaders,
          editableCheckboxes,
          authedUser,
          resolvedReferences,
          currentRepository: repository
        })
      })}
    </article>
  );
}

async function processMarkdownContentAndGetReferences(
  content: string,
  repository: string
) {
  let references: Reference[] = [];

  // preprocess links & mentions
  const preprocessedContent = await remark()
    .use(remarkGfm)
    .use(remarkGithub, {
      repository,
      mentionStrong: false,
      baseURL: PRODUCTION_DOMAIN,
      buildUrl: ({ fullUrlMatch, ...values }) => {
        const searchParams = new URLSearchParams(values);
        switch (values.type) {
          case "commit":
            references.push(values);
            return `${env.NEXT_PUBLIC_VERCEL_URL}/${values.user}/${
              values.project
            }/commit/${values.hash}?${searchParams.toString()}`;
          case "issue":
            references.push(values);
            return `${env.NEXT_PUBLIC_VERCEL_URL}/${values.user}/${
              values.project
            }/issues/${values.no}?${searchParams.toString()}`;
          case "mention":
            references.push(values);
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

  const processedContent = await compile(preprocessedContent, {
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

  return {
    references,
    processedContent: String(processedContent)
  };
}

async function resolveReferences(
  references: Reference[],
  authedUser: User | null
): Promise<ResolvedReferences> {
  const issueReferences = references.filter(
    (ref) => ref.type === "issue"
  ) as IssueReference[];

  const userMentions = references
    .map((ref) => (ref.type === "mention" ? ref.user : null))
    .filter((item) => item !== null) as string[];

  const [resolvedIssues, resolvedMentions] = await Promise.all([
    getMultipleIssuesPerRepositories(issueReferences, authedUser),
    getMultipleUserByUsername(userMentions)
  ]);

  return {
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
  };
}

async function getComponents({
  linkHeaders,
  editableCheckboxes,
  resolvedReferences,
  authedUser,
  currentRepository
}: {
  linkHeaders: boolean;
  editableCheckboxes: boolean;
  resolvedReferences: ResolvedReferences;
  authedUser: User | null;
  currentRepository: string;
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
    video: (props) => (
      <details
        className="rounded-md border border-neutral"
        suppressHydrationWarning
      >
        <summary
          className={clsx(
            "py-2 px-4 cursor-pointer w-full",
            "[&::marker]:hidden [&::marker]:[content:'']",
            "inline-flex gap-1 items-center"
          )}
        >
          <DeviceCameraVideoIcon className="h-4" />
          <span className="sr-only">Video description</span>
          {props["aria-label"] ?? props.src}
          <TriangleDownIcon className="h-4" />
        </summary>
        <video
          muted={true}
          controls={true}
          className="rounded-b-md"
          src={props.src}
          {...props}
        ></video>
      </details>
    ),
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
      return (
        <p suppressHydrationWarning {...props} key={key} className={"my-4"}>
          {props.children}
        </p>
      );
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
          currentRepository={currentRepository}
          resolvedReferences={resolvedReferences}
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
