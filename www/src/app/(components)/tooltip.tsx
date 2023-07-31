"use client";

import * as React from "react";
import {
  OverlayArrow,
  Tooltip as ReactAriaTooltip,
  TooltipProps as ReactAriaTooltipProps,
  TooltipTrigger,
} from "react-aria-components";
import { clsx } from "~/lib/shared-utils";

export type TooltipProps = {
  children?: React.ReactNode;
  content: React.ReactNode;
  delayInMs?: number;
  closeDelayInMs?: number;
} & Pick<ReactAriaTooltipProps, "placement" | "isOpen">;

export function Tooltip({
  children,
  content,
  delayInMs = 150,
  closeDelayInMs = 150,
  placement,
  isOpen,
}: TooltipProps) {
  return (
    <TooltipTrigger
      delay={delayInMs}
      closeDelay={closeDelayInMs}
      isOpen={isOpen}
    >
      {children}
      <ReactAriaTooltip
        offset={5}
        placement={placement}
        className={clsx(
          "bg-tooltip-dark text-white px-2 py-1 rounded-md group/tooltip"
        )}
      >
        <OverlayArrow>
          <svg
            width={8}
            height={8}
            className={clsx(
              "fill-tooltip-dark",
              "group-data-[placement=left]/tooltip:-rotate-90",
              "group-data-[placement=right]/tooltip:rotate-90",
              "group-data-[placement=bottom]/tooltip:rotate-180"
            )}
          >
            <path d="M0 0,L4 4,L8 0" />
          </svg>
        </OverlayArrow>

        {content}
      </ReactAriaTooltip>
    </TooltipTrigger>
  );
}
