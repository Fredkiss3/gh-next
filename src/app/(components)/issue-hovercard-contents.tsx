import * as React from "react";
// components
import {
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon
} from "@primer/octicons-react";
import Link from "next/link";
import { LabelBadge } from "./label-badge";

// utils
import { formatDate } from "~/lib/shared/utils.shared";
import { IssueStatuses } from "~/lib/server/db/schema/issue.sql";

// types
import type { IssueStatus } from "~/lib/server/db/schema/issue.sql";
import type { Label } from "~/lib/server/db/schema/label.sql";
import { Avatar } from "~/app/(components)/avatar";
export type IssueHoverCardContentsProps = {
  id: number;
  status: IssueStatus;
  title: string;
  excerpt?: string;
  createdAt: Date;
  labels: Array<Pick<Label, "name" | "id" | "color">>;
  isAuthor?: boolean;
  isMentioned?: boolean;
  hasCommented?: boolean;
  userAvatarURL?: string;
};

export function IssueHoverCardContents({
  id,
  status,
  title,
  excerpt,
  createdAt,
  labels,
  isAuthor,
  userAvatarURL,
  isMentioned,
  hasCommented
}: IssueHoverCardContentsProps) {
  const showFooter = userAvatarURL && (isAuthor || isMentioned);
  let footerMessage = "";
  if (hasCommented && isMentioned) {
    footerMessage = "You were mentioned on and commented on this issue";
  } else if (hasCommented && isAuthor) {
    footerMessage = "You commented and opened this issue";
  } else if (hasCommented) {
    footerMessage = "You commented on this issue";
  } else if (isMentioned) {
    footerMessage = "You were mentionned on this issue";
  } else if (isAuthor) {
    footerMessage = "You opened this issue";
  }

  return (
    <div className="w-[350px] flex flex-col">
      <div className="flex flex-col gap-4 p-5">
        <small className="text-grey">Opened {formatDate(createdAt)}</small>
        <div className="flex items-start gap-2">
          {status === IssueStatuses.OPEN && (
            <IssueOpenedIcon className="h-5 w-5 flex-shrink-0 text-success" />
          )}
          {status === IssueStatuses.CLOSED && (
            <IssueClosedIcon className="h-5 w-5 flex-shrink-0 text-done" />
          )}
          {status === IssueStatuses.NOT_PLANNED && (
            <SkipIcon className="h-5 w-5 flex-shrink-0 text-grey" />
          )}

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Link
                href={`/issues/${id}`}
                className="group/card inline break-words font-semibold text-foreground hover:text-accent"
              >
                {title}&nbsp;
                <span className="font-normal text-grey group-hover/card:text-accent">
                  #{id}
                </span>
              </Link>

              {excerpt && <p className="text-sm text-grey">{excerpt}</p>}
            </div>

            <ul className="flex flex-wrap gap-2">
              {labels.map(({ id, name, color }) => (
                <LabelBadge key={id} color={color} title={name} />
              ))}
            </ul>
          </div>
        </div>
      </div>
      {showFooter && (
        <footer className="p-5 flex items-center gap-4 border-t border-neutral">
          <Avatar size="small" src={userAvatarURL} username="" />
          <small className="text-grey text-sm font-medium">
            {footerMessage}
          </small>
        </footer>
      )}
    </div>
  );
}
