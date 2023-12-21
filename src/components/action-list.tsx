"use client";
import * as React from "react";
// components
import { Popover, Transition } from "@headlessui/react";
import { XIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
export type ActionListItem<T> = T & {
  selected?: boolean;
  id?: string | number;
};

export type ActionListGroup<T> = {
  header?: {
    title: string;
    filled?: boolean;
  };
  horizontal?: boolean;
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

  renderItem: (
    args: ActionListItem<TItem> & {
      className: string;
      onCloseList: () => void;
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
  renderItem
}: ActionListProps<TItem>) {
  return (
    <Popover as="div" className={clsx("relative", className)}>
      {({ close }) => (
        <>
          <Popover.Button as={React.Fragment}>{children}</Popover.Button>

          <Transition
            as={React.Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <div
              className={clsx(
                itemsClassName,
                "fixed inset-0 flex min-h-full items-center justify-center overflow-y-auto p-5",
                "sm:absolute sm:bottom-[auto] sm:top-[calc(100%+5px)] sm:p-0",
                "z-50",
                {
                  "sm:left-[auto] sm:right-0": align === "right",
                  "sm:left-0 sm:right-[auto]": align === "left"
                }
              )}
            >
              <div className="fixed inset-0 bg-backdrop bg-opacity-80 sm:hidden" />

              <Popover.Panel
                as="div"
                className={clsx(
                  "w-full rounded-md text-base",
                  "border-2 border-neutral bg-subtle text-foreground shadow-lg",
                  "flex min-w-max flex-col",
                  "relative z-50",
                  "sm:border sm:text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                )}
              >
                {title && (
                  <header
                    className={clsx(
                      "flex justify-between gap-4 border-b border-neutral/70 px-4 py-4 font-medium text-xs",
                      "sm:py-2"
                    )}
                  >
                    <span>{title}</span>
                    <button onClick={close} type="button">
                      <XIcon className="h-5 w-5 text-grey" />
                    </button>
                  </header>
                )}

                {header && (
                  <div className="border-b border-neutral/70 px-4 py-4 md:py-2">
                    {header}
                  </div>
                )}

                {groups.map((group, groupIndex) => {
                  return (
                    <div
                      key={`group-${groupIndex}`}
                      className={clsx("border-neutral/70", {
                        "border-b": groupIndex < groups.length - 1
                      })}
                    >
                      {group.header && (
                        <div
                          className={clsx(
                            "w-full border-b border-t border-neutral/70 px-4 py-2 font-medium text-grey text-xs sm:py-2",
                            {
                              "bg-neutral/50": group.header.filled
                            }
                          )}
                        >
                          {group.header.title}
                        </div>
                      )}
                      <ul
                        className={clsx("flex max-h-[400px] overflow-auto", {
                          "min-w-max flex-col": !group.horizontal,
                          "max-w-[300px] flex-row flex-wrap gap-2 px-4 py-4":
                            group.horizontal
                        })}
                      >
                        {group.items.map((item, itemIndex) => (
                          <React.Fragment
                            key={item.id ?? `group-${groupIndex}-${itemIndex}`}
                          >
                            {renderItem({
                              className: clsx(
                                "border-neutral/70 px-4 py-4",
                                "sm:py-2",
                                {
                                  "min-w-[250px] w-full sm:max-w-[300px]":
                                    !group.horizontal,
                                  "border-b":
                                    itemIndex < group.items.length - 1 &&
                                    !noItemBorders &&
                                    !group.horizontal
                                }
                              ),
                              onCloseList: close,
                              ...item
                            })}
                          </React.Fragment>
                        ))}
                      </ul>
                    </div>
                  );
                })}

                {footer && (
                  <footer
                    className={clsx(
                      "border-t border-neutral/70 px-4 py-4 font-medium",
                      "sm:py-2"
                    )}
                  >
                    {footer}
                  </footer>
                )}
              </Popover.Panel>
            </div>
          </Transition>
        </>
      )}
    </Popover>
  );
}
