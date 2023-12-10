import "server-only";
// components
import {
  IssueOpenedIcon,
  IssueClosedIcon,
  SkipIcon
} from "@primer/octicons-react";
import { HoverCard } from "~/app/(components)/hovercard/hovercard";
import { MarkdownTitle } from "~/app/(components)/markdown/markdown-title";
import { UserHoverCardContents } from "~/app/(components)/hovercard/user-hovercard-contents";
import { Avatar } from "~/app/(components)/avatar";
import { IssueHoverCardLink } from "~/app/(components)/hovercard/issue-hovercard-link";
import Link from "next/link";

// utils
import { env } from "~/env";
import { clsx } from "~/lib/shared/utils.shared";
import { z } from "zod";

// types
import type { IssueQueryResult } from "~/app/(models)/issues";
import type { UserQueryResult } from "~/app/(models)/user";

export type ResolvedReferences = {
  issues: Record<number, IssueQueryResult>;
  mentions: Record<string, UserQueryResult>;
};

type MarkdownAProps = {
  resolvedReferences: ResolvedReferences;
  currentRepository: string;
} & React.ComponentProps<"a">;

export async function MarkdownA({
  resolvedReferences,
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
      <IssueHoverCardLink
        href={props.href!}
        user={referenceFound.user}
        repository={referenceFound.project}
        no={Number(referenceFound.no)}
        className={clsx(
          "underline inline-flex gap-1 items-baseline text-accent",
          "ring-accent rounded-md focus:outline-none focus:ring-2"
        )}
      >
        {issueFound.status === "OPEN" && (
          <IssueOpenedIcon className="h-3.5 w-3.5 flex-shrink-0 text-success relative top-0.5" />
        )}
        {issueFound.status === "CLOSED" && (
          <IssueClosedIcon className="h-3.5 w-3.5 flex-shrink-0 text-done relative top-0.5" />
        )}
        {issueFound.status === "NOT_PLANNED" && (
          <SkipIcon className="h-3.5 w-3.5 flex-shrink-0 text-grey relative top-0.5" />
        )}
        <span>
          <MarkdownTitle title={issueFound.title} className="font-semibold" />
          &nbsp;
          <span className="text-grey font-normal">
            {repository.toLowerCase() === currentRepository.toLowerCase()
              ? ""
              : repository}
            #{referenceFound.no}
          </span>
        </span>
      </IssueHoverCardLink>
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
        side="top"
        align="start"
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
        <Link
          href={`/${userFound.username}`}
          className={clsx(
            "inline-flex gap-1 font-bold underline items-center",
            "ring-accent rounded-md focus:outline-none focus:ring-2",
            `mention-${userFound.username}`
          )}
        >
          <Avatar
            src={userFound.avatar_url}
            username={userFound.username}
            size="x-small"
          />
          <span>@{userFound.username}</span>
        </Link>
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
