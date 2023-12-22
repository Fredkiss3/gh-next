"use client";
import * as React from "react";
import * as RadixHoverCard from "@radix-ui/react-hover-card";
import { clsx } from "~/lib/shared/utils.shared";
import { useMediaQuery } from "~/lib/client/hooks/use-media-query";

export type HoverCardProps = {
  children: React.ReactNode;
  content: React.ReactNode;
  delayInMs?: number;
  onOpenChange?: (isOpen: boolean) => void;
  className?: string;
  isOpen?: boolean;
  closeDelayInMs?: number;
} & Pick<RadixHoverCard.HoverCardContentProps, "align" | "side">;

export const HoverCard = React.forwardRef<
  React.ElementRef<typeof RadixHoverCard.Content>,
  HoverCardProps
>(function HoverCard(
  {
    className,
    children,
    content,
    isOpen,
    onOpenChange,
    delayInMs = 150,
    closeDelayInMs = 150,
    ...contentProps
  },
  ref
) {
  const isHoverCardEnabled = useMediaQuery(`(min-width: 768px)`);
  return (
    <RadixHoverCard.Root
      openDelay={delayInMs}
      closeDelay={closeDelayInMs}
      open={isHoverCardEnabled ? isOpen : false}
      onOpenChange={onOpenChange}
    >
      <RadixHoverCard.Trigger asChild>{children}</RadixHoverCard.Trigger>
      <RadixHoverCard.Portal>
        <RadixHoverCard.Content
          ref={ref}
          sideOffset={10}
          className={clsx(
            "data-[side=top]:animate-slideDownAndFade",
            "data-[side=right]:animate-slideLeftAndFade",
            "data-[side=left]:animate-slideRightAndFade",
            "data-[side=bottom]:animate-slideUpAndFade",
            "will-change-[transform,opacity]",
            "relative hidden md:block",
            "z-20 w-max",
            "rounded-md border border-neutral bg-tooltip-light shadow-lg",
            className
          )}
          {...contentProps}
        >
          {content}
          <RadixHoverCard.Arrow className="fill-neutral stroke-neutral stroke-1" />
        </RadixHoverCard.Content>
      </RadixHoverCard.Portal>
    </RadixHoverCard.Root>
  );
});
