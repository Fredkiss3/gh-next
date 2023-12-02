"use client";
import * as React from "react";
// components
import {
  OverlayArrow,
  Tooltip as ReactAriaTooltip,
  TooltipTrigger
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
  onOpenChange?: (arg: boolean) => void;
} & Pick<ReactAriaTooltipProps, "placement">;

export function HoverCard({
  content,
  children,
  onOpenChange,
  delayInMs = 150,
  closeDelayInMs = 150,
  placement = "top right"
}: HoverCardProps) {
  const isTooltipEnabled = useMediaQuery(`(min-width: 768px)`);
  return (
    <TooltipTrigger
      delay={delayInMs}
      closeDelay={closeDelayInMs}
      isDisabled={!isTooltipEnabled}
      onOpenChange={onOpenChange}
    >
      {children}

      <ReactAriaTooltip
        offset={10}
        placement={placement}
        className={clsx(
          "relative hidden md:block",
          "z-20 w-max",
          "rounded-md border border-neutral bg-tooltip-light shadow-lg",
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
              "absolute -top-2.5 h-6 w-6 text-neutral",
              "group-data-[placement=bottom]/row-title-tooltip:rotate-180",
              "group-data-[placement=bottom]/row-title-tooltip:-bottom-2.5 group-data-[placement=bottom]/row-title-tooltip:top-auto"
            )}
          />
          <TriangleDownIcon
            className={clsx(
              "absolute -top-3 h-6 w-6 text-subtle",
              "group-data-[placement=bottom]/row-title-tooltip:rotate-180",
              "group-data-[placement=bottom]/row-title-tooltip:-bottom-3 group-data-[placement=bottom]/row-title-tooltip:top-auto"
            )}
          />
        </OverlayArrow>

        {content}
      </ReactAriaTooltip>
    </TooltipTrigger>
  );
}
