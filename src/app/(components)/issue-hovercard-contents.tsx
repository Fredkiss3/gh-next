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
import { excerpt, formatDate } from "~/lib/shared/utils.shared";
import { IssueStatuses } from "~/lib/server/db/schema/issue.sql";

// types
import type { IssueStatus } from "~/lib/server/db/schema/issue.sql";
import type { Label } from "~/lib/server/db/schema/label.sql";
export type IssueHoverCardContentsProps = {
  id: number;
  status: IssueStatus;
  title: string;
  description?: string;
  created_at: Date;
  labels: Array<Pick<Label, "name" | "id" | "color">>;
};

export function IssueHoverCardContents({
  id,
  status,
  title,
  description,
  created_at,
  labels
}: IssueHoverCardContentsProps) {
  return (
    <div className="flex max-w-[350px] flex-col gap-4 p-5">
      <small className="text-grey">Opened {formatDate(created_at)}</small>
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

            {description && (
              <p className="text-sm text-grey">{excerpt(description, 84)}</p>
            )}
          </div>

          <ul className="flex flex-wrap gap-2">
            {labels.map(({ id, name, color }) => (
              <LabelBadge key={id} color={color} title={name} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
