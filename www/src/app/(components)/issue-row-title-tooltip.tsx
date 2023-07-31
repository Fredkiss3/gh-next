"use client";
import * as React from "react";
// components
import {
  IssueClosedIcon,
  IssueOpenedIcon,
  SkipIcon,
} from "@primer/octicons-react";
import Link from "next/link";
import { LabelBadge } from "./label-badge";
import {
  OverlayArrow,
  Tooltip as RATooltip,
  TooltipTrigger,
} from "react-aria-components";

// utils
import { clsx, excerpt, formatDate } from "~/lib/shared-utils";
import { useMediaQuery } from "~/lib/hooks/use-media-query";

// types
import type { IssueStatus } from "~/lib/db/schema/issue";
import type { Label } from "~/lib/db/schema/label";

export type IssueRowTitleTooltipProps = {
  id: number;
  status: IssueStatus;
  title: string;
  description?: string;
  created_at: Date;
  labels: Array<Pick<Label, "name" | "id" | "color">>;
  children: React.ReactNode;
};

/**
 *  TODO: add footnotes wether :
 *    - the user has opened the issue : "You opened this issue"
 *    - the user has commented the issue : "You commented on this issue"
 *    - the user has been mentionned in the issue : "You were mentionned on this issue"
 *
 * and a combination of the 3 : "You were mentioned on and commented on this issue"
 * and a combination of the comment + open : "You commented and opened this issue"
 */
export function IssueRowTitleTooltip({
  id,
  status,
  title,
  description,
  created_at,
  labels,
  children,
}: IssueRowTitleTooltipProps) {
  const isTooltipEnabled = useMediaQuery(`(min-width: 768px)`);
  return (
    <TooltipTrigger delay={150} closeDelay={150} isDisabled={!isTooltipEnabled}>
      {children}

      <RATooltip
        offset={10}
        placement="top right"
        className={clsx(
          "p-5 hidden md:block relative",
          "max-w-[350px] w-max z-20",
          "border border-neutral bg-tooltip-light rounded-md shadow-lg",
          "group/row-title-tooltip"

          // these horribles styles are for the little arrow
          // TODO : reuse these styles but for the <Comment /> component
          // "after:absolute after:-bottom-3 after:left-10 after:rotate-180",
          // "after:h-3 after:w-6 after:bg-neutral",
          // "after:[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)]",
          // "before:z-10 before:absolute before:-bottom-2.5 before:left-10 before:rotate-180",
          // "before:h-3 before:w-6 before:bg-subtle",
          // "before:[clip-path:polygon(50%_0%,_0%_100%,_100%_100%)]"
        )}
      >
        <OverlayArrow>
          <svg
            width={8}
            height={8}
            className="fill-subtle stroke-neutral group-data-[placement=bottom]/row-title-tooltip:rotate-180"
            strokeWidth={1}
          >
            <path d="M0 0,L4 4,L8 0" />
          </svg>
        </OverlayArrow>
        <div className="flex flex-col gap-4">
          <small className="text-grey">Opened {formatDate(created_at)}</small>
          <div className="flex items-start gap-2">
            {status === "OPEN" && (
              <IssueOpenedIcon className="h-5 w-5 flex-shrink-0 text-success" />
            )}
            {status === "CLOSED" && (
              <IssueClosedIcon className="h-5 w-5 flex-shrink-0 text-done" />
            )}
            {status === "NOT_PLANNED" && (
              <SkipIcon className="h-5 w-5 flex-shrink-0 text-grey" />
            )}

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Link
                  href={`/issues/${id}`}
                  className="inline text-foreground group/card hover:text-accent break-words font-semibold"
                >
                  {title}&nbsp;
                  <span className="text-grey group-hover/card:text-accent font-normal">
                    #{id}
                  </span>
                </Link>

                {description && (
                  <p className="text-grey text-sm">
                    {excerpt(description, 84)}
                  </p>
                )}
              </div>

              <ul className="flex gap-2 flex-wrap">
                {labels.map(({ id, name, color }) => (
                  <LabelBadge key={id} color={color} title={name} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </RATooltip>
    </TooltipTrigger>
  );
}
