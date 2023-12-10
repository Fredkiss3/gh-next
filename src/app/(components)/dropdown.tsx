"use client";
import * as React from "react";

// components
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { useRouter } from "next/navigation";

export const DropdownRoot = DropdownMenu.Root;

export const DropdownTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Trigger>,
  { children: React.ReactNode }
>(function DropdownTrigger({ children }, ref) {
  return (
    <DropdownMenu.Trigger asChild ref={ref}>
      {children}
    </DropdownMenu.Trigger>
  );
});

export type DropdownContentProps = DropdownMenu.DropdownMenuContentProps & {
  className?: string;
  children: React.ReactNode;
};

export const DropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  DropdownContentProps
>(function DropdownContent({ className, children, ...props }, ref) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        ref={ref}
        {...props}
        className={clsx(
          "z-40 rounded-lg py-2",
          "border border-neutral bg-subtle text-foreground shadow-md",
          "flex min-w-max flex-col",
          "min-w-[200px]",
          className
        )}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
});

export function DropdownSeparator() {
  return <DropdownMenu.Separator className="h-[1px] bg-neutral my-2" />;
}

export type DropdownItemLink = {
  text: string;
  href: string;
};

export type DropdownItemButton = {
  text: string;
  onClick: (e: Event) => void | Promise<void>;
};

export type DropdownItemProps = (DropdownItemLink | DropdownItemButton) & {
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
};

function isDropdownMenuButton(
  item: DropdownItemLink | DropdownItemButton
): item is DropdownItemButton {
  return (item as DropdownItemButton).onClick !== undefined;
}

export const DropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Item>,
  DropdownItemProps
>(function DropdownItem(props, ref) {
  const Icon = props.icon;
  const router = useRouter();
  return (
    <div className="px-2">
      <DropdownMenu.Item
        className={clsx(
          "focus-visible:outline-none text-sm px-2 py-1.5",
          props.className
        )}
        asChild
        ref={ref}
        onSelect={(e) => {
          if (isDropdownMenuButton(props)) {
            props.onClick(e);
          } else {
            router.push(props.href);
          }
        }}
      >
        {isDropdownMenuButton(props) ? (
          <button
            className={clsx(
              "flex w-full min-w-max items-center gap-2 focus:outline-none focus-visible:outline-none",
              "data-[highlighted]:rounded-md data-[highlighted]:bg-neutral"
            )}
          >
            {Icon && (
              <Icon className="h-4 w-4 flex-shrink-0 text-grey" aria-label="" />
            )}
            <span>{props.text}</span>
          </button>
        ) : (
          <Link
            href={props.href}
            className={clsx(
              "flex w-full min-w-max items-center gap-2 focus:outline-none focus-visible:outline-none",
              "data-[highlighted]:rounded-md data-[highlighted]:bg-neutral data-[highlighted]:outline-none"
            )}
          >
            {Icon && (
              <Icon className="h-4 w-4 flex-shrink-0 text-grey" aria-label="" />
            )}
            <span className="flex-shrink-0">{props.text}</span>
          </Link>
        )}
      </DropdownMenu.Item>
    </div>
  );
});
