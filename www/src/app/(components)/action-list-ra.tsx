"use client";
import * as React from "react";
// components
import { XIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared-utils";
import {
  Item,
  Menu,
  MenuTrigger,
  Popover,
  Section,
  Header,
} from "react-aria-components";
import { ReactAriaButton } from "./react-aria-button";

// types
import type { PopoverProps } from "react-aria-components";
export type ActionListItem<T> = T & {
  selected?: boolean;
  id: number;
};

export type ActionListGroup<T> = {
  header?: {
    title: string;
    filled?: boolean;
  };
  layout?: "horizontal" | "vertical";
  items: ActionListItem<T>[];
};

export type ActionListProps<TItem> = {
  items: ActionListGroup<TItem>[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  itemsClassName?: string;
  align?: "left" | "right";
  title?: string;
  noItemBorders?: boolean;
  placement?: PopoverProps["placement"];
  "aria-label": string;

  renderItem: (
    args: ActionListItem<TItem> & {
      className: string;
    }
  ) => React.ReactNode;
};

export function ActionList<TItem>({
  items: groups,
  align = "right",
  className,
  itemsClassName,
  children,
  title,
  header,
  footer,
  noItemBorders = false,
  placement = "bottom right",
  "aria-label": ariaLabel,
  renderItem,
}: ActionListProps<TItem>) {
  return (
    <MenuTrigger>
      <ReactAriaButton>{children}</ReactAriaButton>

      <Popover
        placement={placement}
        aria-label={ariaLabel}
        className={clsx(
          "rounded-md w-full text-base",
          "bg-subtle text-foreground shadow-lg border-2 border-neutral",
          "flex flex-col min-w-max",
          "relative z-50",
          "sm:text-sm sm:border",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        )}
      >
        {title && (
          <header
            className={clsx(
              "flex font-medium justify-between gap-4 border-b border-neutral/70 px-4 py-4",
              "sm:py-2"
            )}
          >
            <span>{title}</span>
            <button type="button">
              <XIcon className="h-5 w-5 text-grey" />
            </button>
          </header>
        )}

        {header && (
          <div className="border-b border-neutral/70 px-4 py-4 md:py-2">
            {header}
          </div>
        )}

        <Menu>
          {groups.map((section, sectionIndex) => {
            const isLayoutHorizontal =
              (section.layout ?? "vertical") === "horizontal";
            return (
              <Section
                key={`group-${sectionIndex}`}
                className={clsx("border-neutral/70", {
                  "border-b": sectionIndex < groups.length - 1,
                })}
                // className={clsx("flex max-h-[400px] overflow-auto", {
                //   "flex-col min-w-max": !isLayoutHorizontal,
                //   "flex-row px-4 py-4 flex-wrap gap-2 max-w-[300px]":
                //     isLayoutHorizontal,
                // })}
              >
                {section.header && (
                  <Header
                    className={clsx(
                      "font-medium text-grey px-4 py-2 sm:py-2 w-full border-t border-b border-neutral/70",
                      {
                        "bg-neutral/50": section.header.filled,
                      }
                    )}
                  >
                    {section.header.title}
                  </Header>
                )}

                {section.items.map((item, itemIndex) => (
                  <Item key={item.id}>
                    {renderItem({
                      ...item,
                      className: clsx(
                        "border-neutral/70 px-4 py-4",
                        "sm:py-2",
                        {
                          "min-w-[250px] w-full": !isLayoutHorizontal,
                          "border-b":
                            itemIndex < section.items.length - 1 &&
                            !noItemBorders &&
                            !isLayoutHorizontal,
                        }
                      ),
                    })}
                  </Item>
                ))}
              </Section>
            );
          })}
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}
