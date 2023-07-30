import * as React from "react";
// components
import {
  CommentIcon,
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { AvatarStack } from "./avatar-stack";
import { LabelBadge } from "./label-badge";
import { IssueRowTitle } from "./issue-row-title";

// utils
import { clsx, formatDate } from "~/lib/shared-utils";

// types
import type { IssueStatus } from "~/lib/db/schema/issue";
import type { Label } from "~/lib/db/schema/label";
import type { User } from "~/lib/db/schema/user";

export type IssueRowProps = {
  id: number;
  status: IssueStatus;
  title: string;
  author: string;
  status_updated_at: Date;
  noOfComments: number;
  labels: Array<Pick<Label, "name" | "id" | "color">>;
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
}: IssueRowProps) {
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
          <IssueRowTitle id={id}>
            <Link
              href={`/issues/${id}`}
              className="inline text-foreground hover:text-accent break-words font-semibold text-lg"
            >
              {title}
            </Link>
          </IssueRowTitle>
          &nbsp;&nbsp;
          <span className="inline-flex flex-wrap gap-2">
            {labels.map(({ id, name, color }) => (
              <Link key={id} href={`/issues?q=is:open+label:"${name}"`}>
                <LabelBadge color={color} title={name} />
              </Link>
            ))}
          </span>
        </div>

        <small className="text-grey">
          #{id} opened {formatDate(status_updated_at)} by&nbsp;
          <Link
            href={`/issues?q=is:open+author:${author}`}
            className="hover:text-accent"
          >
            {author}
          </Link>
        </small>
      </div>

      <div className="hidden sm:flex items-center gap-4 w-[30%] justify-end">
        <AvatarStack
          users={assigned_to}
          getUserUrl={(username) => `/issues?q=is:open+author:${username}`}
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
