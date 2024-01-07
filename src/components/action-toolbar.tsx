import "client-only";

import * as React from "react";
// components
import * as Toolbar from "@radix-ui/react-toolbar";
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator
} from "~/components/dropdown";
import { Button } from "~/components/button";
import { Tooltip } from "~/components/tooltip";
import { KebabHorizontalIcon } from "@primer/octicons-react";

// utils
import { clsx } from "~/lib/shared/utils.shared";

// types
export type ActionToolbarItem = {
  id: string;
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
};

export type ActionToolbarItemGroups = ActionToolbarItem[];

export type ActionToolbarProps = {
  itemGroups: Array<ActionToolbarItemGroups>;
  className?: string;
  title: string;
  showItems?: boolean;
};

export const ActionToolbar = React.forwardRef<
  React.ElementRef<typeof Toolbar.Root>,
  ActionToolbarProps
>(function ActionToolbar(
  { itemGroups, className, title, showItems = true },
  ref
) {
  const [visibleItemGroups, setVisibleItemGroups] = React.useState(itemGroups);
  const [hiddenItemGroups, setHiddenItemGroups] = React.useState<
    Array<ActionToolbarItemGroups>
  >([]);
  const [hasComputedSize, setHasComputedSize] = React.useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const toolbarRef = React.useRef<React.ElementRef<"div">>(null);

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const TOOLBAR_PADDING = 8; // defined in the class `px-2`
      const ITEM_SIZE = 32;

      const toolbarElement = entry.target as React.ElementRef<
        typeof Toolbar.Root
      >;
      const width = toolbarElement.offsetWidth;
      const maxNumberOfItemsVisible = Math.floor(
        (width - TOOLBAR_PADDING * 2) / ITEM_SIZE // we multiply the padding x2 to account for the left & right position
      );

      const [visible, hidden] = getVisibleAndHiddenToolbarItemGroups(
        itemGroups,
        // we remove 1 because of the dropdown itself which will take one seat
        // and we remove another just to have some margin
        maxNumberOfItemsVisible - 2
      );

      setHiddenItemGroups(hidden);
      setVisibleItemGroups(visible);
      setHasComputedSize((value) => {
        if (!value) return true;
        return value;
      });
    });

    const toolbar = toolbarRef?.current;
    if (toolbar) {
      observer.observe(toolbar);
      return () => {
        observer.unobserve(toolbar);
      };
    }
  }, [itemGroups]);

  return (
    <div className={clsx("w-full overflow-hidden", className)} ref={toolbarRef}>
      <Toolbar.Root
        ref={ref}
        aria-label={title}
        className={clsx("flex w-full px-2 py-1", {
          "justify-end": hiddenItemGroups.length === 0,
          "justify-start": hiddenItemGroups.length > 0
        })}
      >
        {visibleItemGroups.map((items, index) => (
          <React.Fragment key={index}>
            {items.map((item) => (
              <ActionToolbarButton
                {...item}
                key={item.id}
                disabled={!showItems}
                className={clsx("transition-opacity duration-150", {
                  "opacity-0 pointer-events-none":
                    !hasComputedSize || !showItems,
                  "opacity-100 pointer-events-auto":
                    hasComputedSize && showItems
                })}
              />
            ))}

            {/* Don't show the separator for the last group */}
            {index < visibleItemGroups.length - 1 && (
              <Toolbar.Separator
                className={clsx(
                  "h-4 self-center bg-neutral/40 w-[1px] mx-2 block flex-none",
                  "transition-opacity duration-150",
                  {
                    "opacity-0 pointer-events-none":
                      !hasComputedSize || !showItems,
                    "opacity-100 pointer-events-auto":
                      hasComputedSize && showItems
                  }
                )}
              />
            )}
          </React.Fragment>
        ))}

        {hiddenItemGroups.length > 0 && showItems && (
          <DropdownRoot open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <Toolbar.Button asChild>
              <DropdownTrigger>
                <Button
                  type="button"
                  isSquared
                  variant="neutral"
                  className={clsx(
                    "ml-auto flex-none",
                    "transition-opacity duration-150",
                    {
                      "opacity-0": !hasComputedSize,
                      "opacity-100": hasComputedSize
                    }
                  )}
                >
                  <span className="sr-only">More actions</span>
                  <KebabHorizontalIcon className="h-4 w-4 text-grey" />
                </Button>
              </DropdownTrigger>
            </Toolbar.Button>

            <DropdownContent align="end" aria-label={title}>
              {hiddenItemGroups.map((items, index) => (
                <React.Fragment key={index}>
                  {items.map((item) => (
                    <DropdownItem
                      key={item.id}
                      text={item.label}
                      onClick={item.onClick}
                      icon={item.icon}
                    />
                  ))}

                  {/* Don't show the separator for the last group */}
                  {index < hiddenItemGroups.length - 1 && <DropdownSeparator />}
                </React.Fragment>
              ))}
            </DropdownContent>
          </DropdownRoot>
        )}
      </Toolbar.Root>
    </div>
  );
});

type ActionToolbarButtonProps = React.ComponentProps<typeof Toolbar.Button> &
  ActionToolbarItem;

const ActionToolbarButton = React.forwardRef<
  React.ElementRef<typeof Toolbar.Button>,
  ActionToolbarButtonProps
>(function ActionToolbarButton(
  { label, onClick, icon: Icon, className, id, ...props },
  ref
) {
  return (
    <Tooltip content={label} side="top" className="text-xs" delayInMs={500}>
      <Toolbar.Button {...props} asChild ref={ref}>
        <Button
          value={id}
          type="button"
          onClick={onClick}
          isSquared
          variant="neutral"
          className={clsx("flex-none", className)}
        >
          <span className="sr-only">{label}</span>
          <Icon className="h-4 w-4 text-grey" />
        </Button>
      </Toolbar.Button>
    </Tooltip>
  );
});

export function getVisibleAndHiddenToolbarItemGroups(
  itemGroups: Array<ActionToolbarItemGroups>,
  maxNumberOfItemsVisible: number
): [
  visible: Array<ActionToolbarItemGroups>,
  hidden: Array<ActionToolbarItemGroups>
] {
  const visible: Array<ActionToolbarItemGroups> = [];
  const hidden: Array<ActionToolbarItemGroups> = [];
  let visibleItemCount = 0;

  itemGroups.forEach((group) => {
    if (visibleItemCount + group.length <= maxNumberOfItemsVisible) {
      // If the entire group fits within the visible limit
      visible.push(group);
      visibleItemCount += group.length;
    } else if (visibleItemCount < maxNumberOfItemsVisible) {
      // Split the group between visible and hidden
      const itemsRemaining = maxNumberOfItemsVisible - visibleItemCount;
      visible.push(group.slice(0, itemsRemaining));
      hidden.push(group.slice(itemsRemaining));
      visibleItemCount = maxNumberOfItemsVisible;
    } else {
      // Add the entire group to hidden
      hidden.push(group);
    }
  });

  return [visible, hidden];
}
