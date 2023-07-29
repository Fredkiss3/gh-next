"use client";
import * as React from "react";
// components
import { Popover, Transition } from "@headlessui/react";
import { XIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/functions";

// types
export type ActionListItem<T> = T & {
  selected?: boolean;
  id?: string;
};

export type ActionListGroup<T> = {
  header?: {
    title: string;
    filled?: boolean;
  };
  items: ActionListItem<T>[];
};

export type ActionListProps<TItem> = {
  items: ActionListGroup<TItem>[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
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
  children,
  title,
  header,
  footer,
  noItemBorders = false,
  renderItem,
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
                "fixed inset-0 overflow-y-auto flex min-h-full items-center justify-center p-5",
                "sm:absolute sm:top-[calc(100%+5px)] sm:bottom-[auto] sm:p-0",
                "z-50",
                {
                  "sm:right-0 sm:left-[auto]": align === "right",
                  "sm:left-0 sm:right-[auto]": align === "left",
                }
              )}
            >
              <div className="fixed inset-0 bg-backdrop bg-opacity-80 sm:hidden" />

              <Popover.Panel
                as="div"
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
                        "border-b": groupIndex < groups.length - 1,
                      })}
                    >
                      {group.header && (
                        <div
                          className={clsx(
                            "font-medium text-grey px-4 py-4 sm:py-2 w-full",
                            {
                              "border-t border-b border-neutral/70 bg-neutral/50":
                                group.header.filled,
                            }
                          )}
                        >
                          {group.header.title}
                        </div>
                      )}
                      <ul className="flex flex-col min-w-max max-h-[400px] overflow-auto">
                        {group.items.map((item, itemIndex) => (
                          <React.Fragment
                            key={item.id ?? `group-${groupIndex}-${itemIndex}`}
                          >
                            {renderItem({
                              className: clsx(
                                "min-w-[250px] w-full",
                                "border-neutral/70 px-4 py-4",
                                "sm:py-2",
                                {
                                  "border-b":
                                    itemIndex < group.items.length - 1 &&
                                    !noItemBorders,
                                }
                              ),
                              onCloseList: close,
                              ...item,
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
                      "px-4 py-4 border-t border-neutral/70 font-medium",
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

// type ActionListItemProps = {
//   item: ({ className }) => React.ReactNode;
//   selected?: boolean;
//   closeActionList: () => void;
// };

// function ActionListItem({
//   item,
//   selected,
//   closeActionList,
// }: ActionListItemProps) {
//   return (
//     <div className="flex items-center gap-2 min-w-[250px]">
//       <div className="h-6 w-6 flex items-center justify-center px-2 flex-shrink-0">
//         {selected && <CheckIcon className="h-5 w-5 flex-shrink-0" />}
//       </div>

//       {isActionListLink(item) ? (
//         <Link
//           href={item.href}
//           onClick={closeActionList}
//           className={clsx("flex items-center gap-2 min-w-max w-full")}
//         >
//           {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-grey" />}
//           <span className="flex-shrink-0">{item.text}</span>
//         </Link>
//       ) : (
//         <button
//           className={clsx("flex items-center gap-2 min-w-max w-full")}
//           onClick={item.onClick}
//         >
//           {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-grey" />}
//           <span>{item.text}</span>
//         </button>
//       )}
//     </div>
//   );
// }

// type ActionListGroupProps = {
//   item: ActionListGroup;
//   closeActionList: () => void;
// };

// function ActionListGroup(props: ActionListGroupProps) {
//   return <></>;
// }
