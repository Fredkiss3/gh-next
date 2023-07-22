"use client";
import * as React from "react";

// components
import { Menu } from "@headlessui/react";
import Link from "next/link";

// utils
import { clsx } from "~/lib/functions";

// types
import type { Route } from "next";
export type DropdownMenuLink = {
  id?: string;
  text: string;
  href: Route;
};

export type DropdownMenuButton = {
  id?: string;
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
  align?: "left" | "right";
};

export function DropdownMenu({
  items,
  align = "right",
  className,
  children,
}: DropdownMenuProps) {
  return (
    <Menu as="div" className={clsx("relative z-40", className)}>
      <Menu.Button as={React.Fragment}>{children}</Menu.Button>

      <Menu.Items
        as="ul"
        className={clsx(
          "absolute z-40 rounded-md p-2 top-[calc(100%+5px)]",
          "bg-subtle text-foreground shadow-md border border-neutral",
          "flex flex-col min-w-max",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          {
            "right-0": align === "right",
            "left-0": align === "left",
          }
        )}
      >
        {items.map((item, index) => (
          <Menu.Item key={index} as="li">
            {({ active }) => {
              const Icon = item.icon;
              if (isDropdownMenuButton(item)) {
                return (
                  <button
                    className={clsx(
                      "flex items-center gap-2 min-w-max p-1 w-full",
                      {
                        "bg-neutral rounded-md": active,
                      }
                    )}
                    onClick={item.onClick}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 flex-shrink-0 text-grey" />
                    )}
                    <span>{item.text}</span>
                  </button>
                );
              } else {
                return (
                  <Link
                    href={item.href}
                    className={clsx(
                      "flex items-center gap-2 min-w-max p-1 w-full",
                      {
                        "bg-neutral  rounded-md": active,
                      }
                    )}
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 flex-shrink-0 text-grey" />
                    )}
                    <span className="flex-shrink-0">{item.text}</span>
                  </Link>
                );
              }
            }}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
}
