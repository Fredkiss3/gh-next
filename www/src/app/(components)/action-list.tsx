"use client";
import * as React from "react";
// components
import { Popover, Transition } from "@headlessui/react";
import Link from "next/link";
import { CheckIcon, XIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/functions";

// types
import type { Route } from "next";
export type ActionListLink = {
  id?: string;
  text: string;
  href: Route;
};

export type ActionListButton = {
  id?: string;
  text: string;
  onClick: () => void | Promise<void>;
};

export type ActionListDivider = {
  style?: "filled" | "subtle";
  type: "divider";
};

export type ActionListItem =
  | ((ActionListLink | ActionListButton) & {
      icon?: React.ComponentType<{ className?: string }>;
      selected?: boolean;
    })
  | ActionListDivider;

export type ActionListGroup = {
  header?:
    | string
    | {
        title: string;
        style?: "filled" | "subtle";
      };
  items: ActionListItem[];
};

function isActionListLink(item: ActionListItem): item is ActionListLink {
  return "href" in item && item.href !== undefined;
}

function isActionListDivider(item: ActionListItem): item is ActionListDivider {
  return "type" in item;
}

function isActionListGroup(
  itemOrGroup: ActionListItem | ActionListGroup
): itemOrGroup is ActionListGroup {
  return "items" in itemOrGroup;
}

export type ActionListProps = {
  items: ActionListItem[] | ActionListGroup[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  title?: string;
  selectableItems?: boolean;
};

export function ActionList({
  items,
  align = "right",
  className,
  children,
  title,
  header,
  footer,
  selectableItems = false,
}: ActionListProps) {
  return (
    <Popover as="div" className={clsx("relative z-40", className)}>
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
            <Popover.Panel
              as="ul"
              className={clsx(
                "absolute z-40 rounded-md top-[calc(100%+5px)] text-sm",
                "bg-subtle text-foreground shadow-md border border-neutral",
                "flex flex-col min-w-max",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                {
                  "right-0": align === "right",
                  "left-0": align === "left",
                }
              )}
            >
              {title && (
                <li className="flex justify-between gap-4 border-b border-neutral px-4 py-2">
                  <span>{title}</span>
                  <button onClick={close} type="button">
                    <XIcon className="h-5 w-5 text-grey" />
                  </button>
                </li>
              )}

              {header && (
                <li className="border-b border-neutral px-4 py-2">{header}</li>
              )}

              {items.map((item, index) => {
                return (
                  <li
                    key={index}
                    className={clsx("border-neutral px-4 py-2", {
                      "border-b": index < items.length - 1,
                      "hover:bg-neutral/50": !isActionListGroup(item),
                    })}
                  >
                    {!isActionListGroup(item) ? (
                      <ActionListItem item={item} closeActionList={close} />
                    ) : (
                      <></>
                    )}
                  </li>
                );
              })}

              {footer && (
                <li className="px-4 py-2 border-t border-neutral">{footer}</li>
              )}
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
}

type ActionListItemProps = {
  item: ActionListItem;
  closeActionList: () => void;
};

function ActionListItem({ item, closeActionList }: ActionListItemProps) {
  if (isActionListDivider(item)) {
    return (
      <div
        className={clsx("border border-neutral w-full", {
          "h-[1px]": item.style !== "filled",
          "h-1 bg-neutral": item.style === "filled",
        })}
      />
    );
  }

  const Icon = item.icon;

  return (
    <div className="flex items-center gap-2 min-w-[250px]">
      <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
        {item.selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
      </div>
      {isActionListLink(item) ? (
        <Link
          href={item.href}
          onClick={closeActionList}
          className={clsx("flex items-center gap-2 min-w-max w-full text-sm")}
        >
          {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-grey" />}
          <span className="flex-shrink-0">{item.text}</span>
        </Link>
      ) : (
        <button
          className={clsx("flex items-center gap-2 min-w-max w-full text-sm")}
          onClick={item.onClick}
        >
          {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-grey" />}
          <span>{item.text}</span>
        </button>
      )}
    </div>
  );
}

type ActionListGroupProps = {
  item: ActionListGroup;
  closeActionList: () => void;
};

function ActionListGroup() {}
