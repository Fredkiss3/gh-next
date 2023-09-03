"use client";
import * as React from "react";
// components
import {
  OverlayArrow,
  Tooltip as ReactAriaTooltip,
  TooltipTrigger,
} from "react-aria-components";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";

// types
import type { TooltipProps as ReactAriaTooltipProps } from "react-aria-components";
import { TriangleDownIcon } from "@primer/octicons-react";

export type HoverCardProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  delayInMs?: number;
  closeDelayInMs?: number;
} & Pick<ReactAriaTooltipProps, "placement">;

/**
 *  TODO: add footnotes wether :
 *    - the user has opened the issue : "You opened this issue"
 *    - the user has commented the issue : "You commented on this issue"
 *    - the user has been mentionned in the issue : "You were mentionned on this issue"
 *
 * and a combination of the 3 : "You were mentioned on and commented on this issue"
 * and a combination of the comment + open : "You commented and opened this issue"
 */
export function HoverCard({
  content,
  children,
  delayInMs = 150,
  closeDelayInMs = 150,
  placement = "top right",
}: HoverCardProps) {
  const isTooltipEnabled = useMediaQuery(`(min-width: 768px)`);
  return (
    <TooltipTrigger
      delay={delayInMs}
      closeDelay={closeDelayInMs}
      isDisabled={!isTooltipEnabled}
    >
      {children}

      <ReactAriaTooltip
        offset={10}
        placement={placement}
        className={clsx(
          "hidden md:block relative",
          "w-max z-20",
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
        <OverlayArrow className="relative">
          <TriangleDownIcon
            className={clsx(
              "h-6 w-6 absolute -top-2.5 text-neutral",
              "group-data-[placement=bottom]/row-title-tooltip:rotate-180",
              "group-data-[placement=bottom]/row-title-tooltip:top-auto group-data-[placement=bottom]/row-title-tooltip:-bottom-2.5"
            )}
          />
          <TriangleDownIcon
            className={clsx(
              "h-6 w-6 absolute -top-3 text-subtle",
              "group-data-[placement=bottom]/row-title-tooltip:rotate-180",
              "group-data-[placement=bottom]/row-title-tooltip:top-auto group-data-[placement=bottom]/row-title-tooltip:-bottom-3"
            )}
          />
        </OverlayArrow>

        {content}
      </ReactAriaTooltip>
    </TooltipTrigger>
  );
}
