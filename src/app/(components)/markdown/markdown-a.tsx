import "server-only";
// components
import {
  IssueOpenedIcon,
  IssueClosedIcon,
  SkipIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { HoverCard } from "~/app/(components)/hovercard";
import { IssueHoverCardContents } from "~/app/(components)/issue-hovercard-contents";
import { MarkdownTitle } from "~/app/(components)/markdown/markdown-title";
import { ReactAriaLink } from "~/app/(components)/react-aria-button";
import { UserHoverCardContents } from "~/app/(components)/user-hovercard-contents";

// utils
import { env } from "~/env";
import { clsx } from "~/lib/shared/utils.shared";
import { z } from "zod";

// types
import type { IssueQueryResult } from "~/app/(models)/issues";
import type { User } from "~/lib/server/db/schema/user.sql";
import type { UserQueryResult } from "~/app/(models)/user";

export type ResolvedReferences = {
  issues: Record<number, IssueQueryResult>;
  mentions: Record<string, UserQueryResult>;
};

type MarkdownAProps = {
  resolvedReferences: ResolvedReferences;
  authedUser?: User | null;
  currentRepository: string;
} & React.ComponentProps<"a">;

export async function MarkdownA({
  resolvedReferences,
  authedUser,
  currentRepository,
  ...props
}: MarkdownAProps) {
  let isExternal = true;
  let referenceFound: Reference | null = null;
  if (props.href) {
    try {
      const url = new URL(props.href, env.NEXT_PUBLIC_VERCEL_URL);
      const baseURL = new URL(env.NEXT_PUBLIC_VERCEL_URL);
      isExternal = url.hostname !== baseURL.hostname;

      const parseResult = ReferenceSchema.safeParse(
        [...url.searchParams.keys()].reduce(
          (acc, key) => {
            const value = url.searchParams.get(key);

            if (value) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string>
        )
      );

      if (parseResult.success) {
        referenceFound = parseResult.data;
        Object.keys(referenceFound).map((key) => url.searchParams.delete(key));
        props.href = url.toString();
      }
    } catch (error) {
      // do nothing
    }
  }

  if (isExternal || !referenceFound) {
    return (
      <a
        {...props}
        target="_blank"
        className="underline inline-flex gap-1 items-baseline text-accent"
      >
        {props.children}
      </a>
    );
  }

  if (referenceFound.type === "issue") {
    const issueFound = resolvedReferences.issues[Number(referenceFound.no)];
    const repository = `${referenceFound.user}/${referenceFound.project}`;

    if (!issueFound) {
      return <span>{props.children}</span>;
    }
    return (
      <HoverCard
        content={
          <IssueHoverCardContents
            id={issueFound.number}
            status={issueFound.status}
            title={issueFound.title}
            excerpt={issueFound.excerpt}
            createdAt={issueFound.createdAt}
            labels={[]}
            isAuthor={authedUser?.id === issueFound.author.id}
            isMentioned={authedUser?.username === issueFound.mentioned_user}
            hasCommented={authedUser?.username === issueFound.commented_user}
            userAvatarURL={authedUser?.avatar_url}
          />
        }
      >
        <ReactAriaLink>
          {/* @ts-expect-error the types are fiiiine ! */}
          <Link
            {...props}
            className={clsx(
              "underline inline-flex gap-1 items-baseline text-accent"
            )}
          >
            {issueFound.status === "OPEN" && (
              <IssueOpenedIcon className="h-4 w-4 flex-shrink-0 text-success relative top-0.5" />
            )}
            {issueFound.status === "CLOSED" && (
              <IssueClosedIcon className="h-4 w-4 flex-shrink-0 text-done relative top-0.5" />
            )}
            {issueFound.status === "NOT_PLANNED" && (
              <SkipIcon className="h-4 w-4 flex-shrink-0 text-grey relative top-0.5" />
            )}
            <span>
              <MarkdownTitle
                title={issueFound.title}
                className="font-semibold"
              />
              &nbsp;
              <span className="text-grey font-normal">
                {repository === currentRepository ? "" : repository}#
                {referenceFound.no}
              </span>
            </span>
          </Link>
        </ReactAriaLink>
      </HoverCard>
    );
  }

  if (referenceFound.type === "mention") {
    const userFound =
      resolvedReferences.mentions[referenceFound.user.toLowerCase()];

    if (!userFound) {
      return <span>{props.children}</span>;
    }
    return (
      <HoverCard
        placement="top start"
        delayInMs={700}
        content={
          <UserHoverCardContents
            avatar_url={userFound.avatar_url}
            bio={userFound.bio}
            location={userFound.location}
            name={userFound.name}
            username={userFound.username}
          />
        }
      >
        <ReactAriaLink>
          <Link
            href={`/u/${userFound.username}`}
            className={clsx(
              "inline-flex gap-1 items-baseline font-bold underline",
              {
                "bg-severe bg-opacity-30 rounded-sm px-0.5 text-yellow-100":
                  authedUser?.id === userFound.id
              }
            )}
          >
            @{userFound.username}
          </Link>
        </ReactAriaLink>
      </HoverCard>
    );
  }

  if (referenceFound.type === "commit") {
    // TODO : handle commit mentions
    return <span>{props.children}</span>;
  }

  return (
    <a
      {...props}
      className="inline-flex gap-1 items-baseline text-accent underline"
    >
      {props.children}
    </a>
  );
}

/**
 * These build URL values from the package 'remark-github' these correspond
 * to the linked issues, commits & mentions
 */
const CommitReferenceSchema = z.object({
  hash: z.string(),
  project: z.string(),
  type: z.literal("commit"),
  user: z.string()
});

export type CommitReference = z.TypeOf<typeof CommitReferenceSchema>;

const IssueReferenceSchema = z.object({
  no: z.string(),
  project: z.string(),
  type: z.literal("issue"),
  user: z.string()
});

export type IssueReference = z.TypeOf<typeof IssueReferenceSchema>;

const MentionReferenceSchema = z.object({
  type: z.literal("mention"),
  user: z.string()
});

export type MentionReference = z.TypeOf<typeof MentionReferenceSchema>;

const ReferenceSchema = z.union([
  CommitReferenceSchema,
  IssueReferenceSchema,
  MentionReferenceSchema
]);

export type Reference = z.TypeOf<typeof ReferenceSchema>;
