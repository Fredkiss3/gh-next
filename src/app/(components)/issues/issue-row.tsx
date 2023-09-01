import * as React from "react";
// components
import {
  CommentIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { AvatarStack } from "~/app/(components)/avatar-stack";
import { LabelBadge } from "~/app/(components)/label-badge";
import { HoverCard } from "~/app/(components)/hovercard";
import { ReactAriaLink } from "~/app/(components)/react-aria-button";
import { IssueHoverCardContents } from "~/app/(components)/issue-hovercard-contents";
import { UserHoverCardContents } from "~/app/(components)/user-hovercard-contents";
import { Tooltip } from "~/app/(components)/tooltip";

// utils
import { clsx, formatDate } from "~/lib/shared/utils.shared";

// types
import type { IssueStatus } from "~/lib/server/db/schema/issue.sql";
import type { Label } from "~/lib/server/db/schema/label.sql";
import type { User } from "~/lib/server/db/schema/user.sql";

export type IssueRowProps = {
  id: number;
  status: IssueStatus;
  title: string;
  author: Omit<User, "preferred_theme" | "id" | "github_id">;
  description?: string;
  status_updated_at: Date;
  created_at: Date;
  noOfComments: number;
  labels: Array<Omit<Label, "description"> & { description?: string }>;
  assigned_to: Array<Pick<User, "username" | "avatar_url">>;
};

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
  description,
}: IssueRowProps) {
  const assignTooltipLabel = assigned_to.map((u) => u.username).join(" and ");
  return (
    <div className="flex relative w-full gap-4 items-start p-5 border-b border-neutral/70 hover:bg-subtle">
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
        className="after:inset-0 after:absolute sm:hidden"
      >
        <span className="sr-only">Link to issue #{id}</span>
      </Link>

      <div
        className={clsx(
          "flex flex-col items-start gap-2 w-full sm:w-[70%] md:w-full"
        )}
      >
        <div className="flex-auto gap-2 flex-wrap">
          <span className="relative group/issue-row-title">
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
                    "inline text-foreground break-words font-semibold text-lg",
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
                      <p className="text-sm max-w-[250px] text-center">
                        {description}
                      </p>
                    }
                    delayInMs={500}
                    closeDelayInMs={500}
                    placement="bottom end"
                  >
                    <ReactAriaLink>
                      <Link
                        prefetch={false}
                        href={`/issues?q=is:open+label:"${name}"`}
                      >
                        <LabelBadge color={color} title={name} />
                      </Link>
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
              <Link
                prefetch={false}
                href={`/issues?q=is:open+author:${author.username}`}
                className="hover:text-accent"
              >
                {author.username}
              </Link>
            </ReactAriaLink>
          </HoverCard>
        </small>
      </div>

      <div className="hidden sm:flex items-center gap-4 w-[30%] justify-end">
        <AvatarStack
          tooltipLabel={`assigned to ${assignTooltipLabel}`}
          users={assigned_to}
          getUserUrl={(username) => `/issues?q=is:open+assignee:${username}`}
        />
        {noOfComments > 0 && (
          <Link
            href={`/issues/${id}`}
            className="text-grey flex items-center gap-1 hover:text-accent"
          >
            <CommentIcon className="h-4 w-4 flex-shrink-0" />
            <span>{noOfComments}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
