"use client";
import * as React from "react";

// components

import Link from "next/link";
import {
  Button,
  Popover,
  Menu,
  Item,
  MenuTrigger
} from "react-aria-components";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
import type { PopoverProps } from "react-aria-components";
import { useRouter } from "next/navigation";

export type DropdownMenuLink = {
  id: string;
  text: string;
  href: string;
};

export type DropdownMenuButton = {
  id: string;
  text: string;
  onClick: () => void | Promise<void>;
};

export type DropdownMenuItem = (DropdownMenuLink | DropdownMenuButton) & {
  icon?: React.ComponentType<{ className?: string }>;
};

function isDropdownMenuButton(
  item: DropdownMenuItem
): item is DropdownMenuButton {
  return (item as DropdownMenuButton).onClick !== undefined;
}

export type DropdownMenuProps = {
  items: DropdownMenuItem[];
  children: React.ReactNode;
  className?: string;
  placement?: PopoverProps["placement"];
};

export function DropdownMenu({
  items,
  placement = "bottom right",
  className,
  children
}: DropdownMenuProps) {
  const router = useRouter();
  return (
    <MenuTrigger>
      <Button
        aria-label="menu"
        className="flex-shrink-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {children}
      </Button>
      <Popover placement={placement}>
        <Menu
          onAction={(key) => {
            const item = items.find((it) => it.id === key);

            if (item) {
              if (isDropdownMenuButton(item)) {
                item.onClick();
              } else {
                router.push(item.href);
              }
            }
          }}
          aria-label="Menu"
          shouldFocusWrap
          className={clsx(
            className,
            "z-40 rounded-lg p-2",
            "border border-neutral bg-subtle text-foreground shadow-md",
            "flex min-w-max flex-col",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          )}
          items={items}
        >
          {(item) => (
            <Item className="focus-visible:outline-none">
              {({ isHovered, isFocused, isPressed, isFocusVisible }) => {
                const Icon = item.icon;
                if (isDropdownMenuButton(item)) {
                  return (
                    <button
                      className={clsx(
                        "flex w-full min-w-max items-center gap-2  p-2 focus:outline-none focus-visible:outline-none",
                        {
                          "rounded-md bg-neutral":
                            isFocused ||
                            isHovered ||
                            isPressed ||
                            isFocusVisible
                        }
                      )}
                      onClick={item.onClick}
                    >
                      {Icon && (
                        <Icon
                          className="h-5 w-5 flex-shrink-0 text-grey"
                          aria-label=""
                        />
                      )}
                      <span>{item.text}</span>
                    </button>
                  );
                } else {
                  return (
                    <Link
                      href={item.href}
                      onClick={close}
                      className={clsx(
                        "flex w-full min-w-max items-center gap-2  p-2 focus:outline-none focus-visible:outline-none",
                        {
                          "rounded-md  bg-neutral outline-none":
                            isFocused ||
                            isHovered ||
                            isFocusVisible ||
                            isPressed
                        }
                      )}
                    >
                      {Icon && (
                        <Icon
                          className="h-5 w-5 flex-shrink-0 text-grey"
                          aria-label=""
                        />
                      )}
                      <span className="flex-shrink-0">{item.text}</span>
                    </Link>
                  );
                }
              }}
            </Item>
          )}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
