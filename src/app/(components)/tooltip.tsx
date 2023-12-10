"use client";
import * as React from "react";

// components
import * as RadixTooltip from "@radix-ui/react-tooltip";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
export type TooltipProps = {
  className?: string;
  children?: React.ReactNode;
  content: React.ReactNode;
  delayInMs?: number;
  isOpen?: boolean;
} & Pick<RadixTooltip.TooltipContentProps, "align" | "side">;

export const Tooltip = React.forwardRef<
  React.ElementRef<typeof RadixTooltip.Content>,
  TooltipProps
>(function Tooltip(
  { className, children, content, delayInMs = 150, isOpen, ...contentProps },
  ref
) {
  return (
    <RadixTooltip.Provider delayDuration={delayInMs}>
      <RadixTooltip.Root open={isOpen}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className={clsx(
              "rounded-md bg-tooltip-dark px-2 py-1 text-white",
              "data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade",
              "data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade",
              "data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade",
              "data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade",
              "will-change-[transform,opacity]",
              className
            )}
            sideOffset={5}
            {...contentProps}
          >
            {content}
            <RadixTooltip.Arrow className="fill-tooltip-dark" />
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
});
