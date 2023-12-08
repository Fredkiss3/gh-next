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

// types
import type { TooltipProps as ReactAriaTooltipProps } from "react-aria-components";
export type TooltipProps = {
  children?: React.ReactNode;
  content: React.ReactNode;
  delayInMs?: number;
  closeDelayInMs?: number;
  disabled?: boolean;
  className?: string;
} & Pick<ReactAriaTooltipProps, "placement" | "isOpen">;

export function Tooltip({
  children,
  content,
  placement,
  isOpen,
  disabled,
  className,
  delayInMs = 150,
  closeDelayInMs = 150
}: TooltipProps) {
  return (
    <TooltipTrigger
      delay={delayInMs}
      closeDelay={closeDelayInMs}
      isOpen={isOpen}
      isDisabled={disabled}
    >
      {children}
      <ReactAriaTooltip
        offset={5}
        placement={placement}
        className={clsx(
          "group/tooltip rounded-md bg-tooltip-dark px-2 py-1 text-white",
          className
        )}
      >
        <OverlayArrow>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height={5}
            width={8}
            viewBox="0 0 512 345.51"
            className={clsx(
              "fill-tooltip-dark relative",
              "group-data-[placement=left]/tooltip:-rotate-90 group-data-[placement=left]/tooltip:right-1",
              "group-data-[placement=right]/tooltip:rotate-90 group-data-[placement=left]/tooltip:left-1",
              "group-data-[placement=bottom]/tooltip:rotate-180"
            )}
          >
            <path d="m3.95 30.57 236.79 307.24c1.02 1.39 2.24 2.65 3.67 3.75 8.27 6.39 20.17 4.87 26.56-3.41l236.11-306.4C510.14 28.38 512 23.91 512 19c0-10.49-8.51-19-19-19H18.93v.06A18.9 18.9 0 0 0 7.36 4.01C-.92 10.4-2.44 22.3 3.95 30.57z" />
          </svg>
        </OverlayArrow>

        {content}
      </ReactAriaTooltip>
    </TooltipTrigger>
  );
}
