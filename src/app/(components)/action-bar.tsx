import "client-only";

import {
  HeadingIcon,
  BoldIcon,
  ItalicIcon,
  QuoteIcon,
  CodeIcon,
  LinkIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
  TasklistIcon,
  MentionIcon,
  CrossReferenceIcon,
  DiffIgnoredIcon,
  KebabHorizontalIcon
} from "@primer/octicons-react";

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

type ActionBarItem = {
  id: string;
  label: string;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
};

export type ActionBarProps = {
  itemGroups: Array<ActionBarItem[]>;
  className?: string;
};

export function ActionBar({ itemGroups, className }: ActionBarProps) {
  return (
    <Toolbar.Root
      className={clsx(
        "flex w-full border-b border-neutral px-2 py-1 justify-end",
        className
      )}
    >
      {itemGroups.map((items, index) => (
        <React.Fragment key={index}>
          {items.map((item, index) => (
            <ActionBarButton key={item.id} {...item} />
          ))}

          {/* Don't show the separator for the last group */}
          {index < itemGroups.length - 1 && (
            <Toolbar.Separator className="h-4 self-center bg-neutral/40 w-[1px] mx-2 hidden lg:block" />
          )}
        </React.Fragment>
      ))}

      {/* TODO... */}
      {/* <DropdownRoot>
        <Toolbar.Button asChild>
          <DropdownTrigger>
            <Button isSquared variant="neutral" className="lg:hidden">
              <span className="sr-only">More actions</span>
              <KebabHorizontalIcon className="h-4 w-4 text-grey" />
            </Button>
          </DropdownTrigger>
        </Toolbar.Button>

        <DropdownContent align="end">
          <DropdownItem icon={LinkIcon} text="Link" onClick={() => {}} />
          <DropdownSeparator />
          <DropdownItem
            text="Numbered list"
            onClick={() => {}}
            icon={ListOrderedIcon}
          />
          <DropdownItem
            text="Unordered list"
            onClick={(e) => {}}
            icon={ListUnorderedIcon}
          />
          <DropdownItem
            text="Task list"
            onClick={() => {}}
            icon={TasklistIcon}
          />
          <DropdownSeparator />
          <DropdownItem text="Mentions" onClick={() => {}} icon={MentionIcon} />
          <DropdownItem
            text="References"
            onClick={() => {}}
            icon={CrossReferenceIcon}
          />
          <DropdownItem
            text="Slash commands"
            onClick={() => {}}
            icon={DiffIgnoredIcon}
          />
        </DropdownContent>
      </DropdownRoot> */}
    </Toolbar.Root>
  );
}

type ActionBarButtonProps = React.ComponentProps<typeof Toolbar.Button> &
  ActionBarItem;

function ActionBarButton({
  label,
  onClick,
  icon: Icon,
  className,
  ...props
}: ActionBarButtonProps) {
  return (
    <Toolbar.Button {...props} asChild>
      <Tooltip
        content={label}
        side="bottom"
        className="text-xs"
        delayInMs={500}
      >
        <Button
          onClick={onClick}
          isSquared
          variant="neutral"
          className={clsx(className)}
        >
          <span className="sr-only">{label}</span>
          <Icon className="h-4 w-4 text-grey" />
        </Button>
      </Tooltip>
    </Toolbar.Button>
  );
}
