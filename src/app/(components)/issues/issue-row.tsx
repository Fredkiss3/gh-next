"use client";
import * as React from "react";
// components
import {
  CommentIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { AvatarStack } from "~/app/(components)/avatar-stack";
import { LabelBadge } from "~/app/(components)/label-badge";
import { HoverCard } from "~/app/(components)/hovercard";
import { ReactAriaLink } from "~/app/(components)/react-aria-button";
import { IssueHoverCardContents } from "~/app/(components)/issue-hovercard-contents";
import { UserHoverCardContents } from "~/app/(components)/user-hovercard-contents";
import { Tooltip } from "~/app/(components)/tooltip";
import { IssueSearchLink } from "./issue-search-link";

// utils
import {
  clsx,
  formatDate,
  issueSearchFilterToString
} from "~/lib/shared/utils.shared";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";

// types
import type { IssueListResult } from "~/lib/server/dto/issue-list.server";
export type IssueRowProps = IssueListResult["issues"][number];

export function IssueRow({
  status,
  title,
  id,
  author,
  status_updated_at,
  noOfComments,
  labels,
  assigned_to,
  created_at,
  description
}: IssueRowProps) {
  const assignTooltipLabel = assigned_to.map((u) => u.username).join(" and ");
  const setSearchQuery = useSearchQueryStore((store) => store.setQuery);

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
        href={`/issues/${id}`}
        className="after:absolute after:inset-0 sm:hidden"
      >
        <span className="sr-only">Link to issue #{id}</span>
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
                  id={id}
                  status={status}
                  title={title}
                  description={description}
                  created_at={created_at}
                  labels={labels}
                />
              }
            >
              <ReactAriaLink>
                <Link
                  href={`/issues/${id}`}
                  className={clsx(
                    "inline break-words text-lg font-semibold text-foreground",
                    "hover:text-accent"
                  )}
                >
                  {title}
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
                        filters={{
                          label: [name]
                        }}
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
          #{id} opened {formatDate(status_updated_at)} by&nbsp;
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
                className="hover:text-accent"
              >
                {author.username}
              </IssueSearchLink>
            </ReactAriaLink>
          </HoverCard>
        </small>
      </div>

      <div className="hidden w-[30%] items-center justify-end gap-4 sm:flex">
        <AvatarStack
          tooltipLabel={`assigned to ${assignTooltipLabel}`}
          users={assigned_to}
          onAvatarLinkClick={(username) =>
            setSearchQuery(
              issueSearchFilterToString({
                is: "open",
                assignee: [username]
              })
            )
          }
          getUserUrl={(username) => `/issues?q=is:open+assignee:${username}`}
        />
        {noOfComments > 0 && (
          <Link
            href={`/issues/${id}`}
            className="flex items-center gap-1 text-grey hover:text-accent"
          >
            <CommentIcon className="h-4 w-4 flex-shrink-0" />
            <span>{noOfComments}</span>
          </Link>
        )}
      </div>
    </div>
  );
}