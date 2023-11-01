import * as React from "react";
// components
import {
  CommentIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { IssueRowAvatarStack } from "~/app/(components)/issues/issue-row-avatar-stack";
import { LabelBadge } from "~/app/(components)/label-badge";
import { HoverCard } from "~/app/(components)/hovercard";
import { ReactAriaLink } from "~/app/(components)/react-aria-button";
import { IssueHoverCardContents } from "~/app/(components)/issue-hovercard-contents";
import { UserHoverCardContents } from "~/app/(components)/user-hovercard-contents";
import { Tooltip } from "~/app/(components)/tooltip";
import { IssueSearchLink } from "./issue-search-link";

// utils
import { clsx, formatDate } from "~/lib/shared/utils.shared";

// types
import type { IssueSearchItem } from "~/app/(models)/dto/issue-search-output-validator";
import { MarkdownTitle } from "~/app/(components)/markdown/markdown-title";

export const emojiSortMap = {
  "reactions-+1-desc": "👍",
  "reactions--1-desc": "👎",
  "reactions-smile-desc": "😄",
  "reactions-tada-desc": "🎉",
  "reactions-thinking_face-desc": "😕",
  "reactions-heart-desc": "❤️",
  "reactions-rocket-desc": "🚀",
  "reactions-eyes-desc": "👀"
} as const;
export type EmojiSortKey = keyof typeof emojiSortMap;

export type IssueRowProps = IssueSearchItem & {
  authedUserId?: number;
  authedUserAvatar?: string;
  authedUserUsername?: string;
  emojiSort?: EmojiSortKey | null;
};

export function IssueRow({
  status,
  title,
  number,
  author,
  status_updated_at,
  no_of_comments,
  labels,
  assigned_to,
  created_at,
  excerpt,
  emojiSort,
  authedUserId,
  authedUserAvatar,
  authedUserUsername,
  mentioned_user,
  commented_user,
  ...reactionCounts
}: IssueRowProps) {
  let emojiCount: number = 0;
  switch (emojiSort) {
    case "reactions-+1-desc":
      emojiCount = reactionCounts.plus_one_count;
      break;
    case "reactions--1-desc":
      emojiCount = reactionCounts.minus_one_count;
      break;
    case "reactions-eyes-desc":
      emojiCount = reactionCounts.eyes_count;
      break;
    case "reactions-heart-desc":
      emojiCount = reactionCounts.heart_count;
      break;
    case "reactions-rocket-desc":
      emojiCount = reactionCounts.rocket_count;
      break;
    case "reactions-smile-desc":
      emojiCount = reactionCounts.laugh_count;
      break;
    case "reactions-tada-desc":
      emojiCount = reactionCounts.hooray_count;
      break;
    case "reactions-thinking_face-desc":
      emojiCount = reactionCounts.confused_count;
      break;
  }

  return (
    <div className="relative flex w-full items-start gap-4 border-b border-neutral/70 p-5 hover:bg-subtle">
      {status === "OPEN" && (
        <IssueOpenedIcon className="h-5 w-5 flex-shrink-0 text-success" />
      )}
      {status === "CLOSED" && (
        <IssueClosedIcon className="h-5 w-5 flex-shrink-0 text-done" />
      )}
      {status === "NOT_PLANNED" && (
        <SkipIcon className="h-5 w-5 flex-shrink-0 text-grey" />
      )}

      <Link
        href={`/issues/${number}`}
        className="after:absolute after:inset-0 sm:hidden"
      >
        <span className="sr-only">Link to issue #{number}</span>
      </Link>

      <div
        className={clsx(
          "flex w-full flex-col items-start gap-2 sm:w-[70%] md:w-full"
        )}
      >
        <div className="flex-auto flex-wrap gap-2">
          <span className="group/issue-row-title relative">
            <HoverCard
              content={
                <IssueHoverCardContents
                  id={number}
                  status={status}
                  title={title}
                  description={excerpt}
                  createdAt={created_at}
                  labels={labels}
                  isAuthor={authedUserId === author.id}
                  isMentioned={authedUserUsername === mentioned_user}
                  hasCommented={authedUserUsername === commented_user}
                  userAvatarURL={authedUserAvatar}
                />
              }
            >
              <ReactAriaLink>
                <Link
                  href={`/issues/${number}`}
                  className={clsx(
                    "inline break-words text-lg font-semibold text-foreground",
                    "hover:text-accent",
                    "transition duration-150",
                    "ring-accent rounded-md focus:outline-none focus:ring-2"
                  )}
                >
                  <MarkdownTitle title={title} className="font-semibold" />
                </Link>
              </ReactAriaLink>
            </HoverCard>
          </span>
          {labels.length > 0 && (
            <>
              &nbsp;&nbsp;
              <span className="inline-flex flex-wrap gap-2">
                {labels.map(({ id, name, color, description }) => (
                  <Tooltip
                    key={id}
                    disabled={!description}
                    content={
                      <p className="max-w-[250px] text-center text-sm">
                        {description}
                      </p>
                    }
                    delayInMs={500}
                    closeDelayInMs={500}
                    placement="bottom end"
                  >
                    <ReactAriaLink>
                      <IssueSearchLink
                        className={clsx(
                          "transition duration-150",
                          "focus:ring-2 ring-accent focus:outline-none rounded-md"
                        )}
                        filters={{
                          label: [name]
                        }}
                        conserveCurrentFilters
                      >
                        <LabelBadge color={color} title={name} />
                      </IssueSearchLink>
                    </ReactAriaLink>
                  </Tooltip>
                ))}
              </span>
            </>
          )}
        </div>

        <small className="text-grey">
          {formatIssueRowSubtext({
            number,
            status_updated_at,
            status
          })}
          {author.id ? (
            <HoverCard
              placement="top start"
              delayInMs={700}
              content={
                <UserHoverCardContents
                  avatar_url={author.avatar_url}
                  bio={author.bio}
                  location={author.location}
                  name={author.name}
                  username={author.username}
                />
              }
            >
              <ReactAriaLink>
                <IssueSearchLink
                  filters={{
                    author: author.username
                  }}
                  className={clsx(
                    "hover:text-accent",
                    "transition duration-150",
                    "focus:ring-2 ring-accent focus:outline-none rounded-md"
                  )}
                >
                  {author.username}
                </IssueSearchLink>
              </ReactAriaLink>
            </HoverCard>
          ) : (
            <IssueSearchLink
              filters={{
                author: author.username
              }}
              className={clsx(
                "hover:text-accent",
                "transition duration-150",
                "ring-accent rounded-md focus:outline-none focus:ring-2"
              )}
            >
              {author.username}
            </IssueSearchLink>
          )}
        </small>
      </div>

      <div className="hidden w-[30%] items-center justify-end gap-8 sm:flex">
        <IssueRowAvatarStack users={assigned_to} />
        {no_of_comments > 0 && (
          <Link
            href={`/issues/${number}`}
            className={clsx(
              "text-grey hover:text-accent flex items-center gap-1",
              "transition duration-150",
              "ring-accent rounded-md focus:outline-none focus:ring-2"
            )}
          >
            <CommentIcon className="h-4 w-4 flex-shrink-0" />
            <span>{no_of_comments}</span>
          </Link>
        )}

        {emojiSort && (
          <Link
            href={`/issues/${number}`}
            className={clsx(
              "text-grey hover:text-accent flex items-center gap-1",
              "transition duration-150",
              "ring-accent rounded-md focus:outline-none focus:ring-2"
            )}
          >
            {emojiSortMap[emojiSort]}
            <span>{emojiCount}</span>
          </Link>
        )}
      </div>
    </div>
  );
}

function formatIssueRowSubtext({
  number,
  status,
  status_updated_at
}: Pick<IssueRowProps, "number" | "status" | "status_updated_at">) {
  return `#${number} ${status === "OPEN" ? "opened" : "closed"} ${formatDate(
    status_updated_at
  )} by `;
}
