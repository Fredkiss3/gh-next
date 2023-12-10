import "client-only";

import * as React from "react";
// components
import {
  DropdownRoot,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator
} from "~/app/(components)/dropdown";
import * as Toolbar from "@radix-ui/react-toolbar";
import { Button } from "~/app/(components)/button";
import { Tooltip } from "~/app/(components)/tooltip";

// utils
import { clsx } from "~/lib/shared/utils.shared";
import { KebabHorizontalIcon } from "@primer/octicons-react";

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
};

export function getVisibleAndHiddenItemGroups(
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

export const ActionToolbar = React.forwardRef<
  React.ElementRef<typeof Toolbar.Root>,
  ActionToolbarProps
>(function ActionToolbar({ itemGroups, className }, ref) {
  const [visibleItemGroups, setVisibleItemGroups] = React.useState(itemGroups);
  const [hiddenItemGroups, setHiddenItemGroups] = React.useState<
    Array<ActionToolbarItemGroups>
  >([]);
  const [hasComputedSize, setHasComputedSize] = React.useState(false);

  const toolbarRef = React.useRef<React.ElementRef<typeof Toolbar.Root>>(null);

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

      const [visible, hidden] = getVisibleAndHiddenItemGroups(
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
      // setTextAreaHeight(textarea.offsetHeight);
      observer.observe(toolbar);
      return () => {
        observer.unobserve(toolbar);
      };
    }
  }, [itemGroups]);

  return (
    <Toolbar.Root
      ref={(domNode) => {
        // @ts-expect-error we want to manually update the ref
        toolbarRef.current = domNode;
        if (typeof ref === "function") {
          ref(domNode);
        } else if (ref) {
          ref.current = domNode;
        }
      }}
      className={clsx(
        "flex w-full px-2 py-1 overflow-hidden",
        {
          "justify-end": hiddenItemGroups.length === 0,
          "justify-start": hiddenItemGroups.length > 0
        },
        className
      )}
    >
      {visibleItemGroups.map((items, index) => (
        <React.Fragment key={index}>
          {items.map((item) => (
            <ActionToolbarButton
              {...item}
              key={item.id}
              className={clsx("transition-opacity duration-150", {
                "opacity-0": !hasComputedSize,
                "opacity-100": hasComputedSize
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
                  "opacity-0": !hasComputedSize,
                  "opacity-100": hasComputedSize
                }
              )}
            />
          )}
        </React.Fragment>
      ))}

      {hiddenItemGroups.length > 0 && (
        <DropdownRoot>
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

          <DropdownContent align="end">
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
  );
});

type ActionToolbarButtonProps = React.ComponentProps<typeof Toolbar.Button> &
  ActionToolbarItem;

function ActionToolbarButton({
  label,
  onClick,
  icon: Icon,
  className,
  ...props
}: ActionToolbarButtonProps) {
  return (
    <Toolbar.Button {...props} asChild>
      <Tooltip
        content={label}
        side="bottom"
        className="text-xs"
        delayInMs={500}
      >
        <Button
          type="button"
          onClick={onClick}
          isSquared
          variant="neutral"
          className={clsx("flex-none", className)}
        >
          <span className="sr-only">{label}</span>
          <Icon className="h-4 w-4 text-grey" />
        </Button>
      </Tooltip>
    </Toolbar.Button>
  );
}
