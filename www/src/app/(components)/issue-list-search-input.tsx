"use client";
import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { clsx, debounce } from "~/lib/shared-utils";
import {
  IN_FILTERS,
  NO_METADATA_FILTERS,
  SORT_FILTERS,
  STATUS_FILTERS,
} from "~/lib/constants";

export type IssueListSearchInputProps = {
  onSearch: () => void;
};

// Inspired by : https://github.com/openstatusHQ/openstatus/blob/main/apps/web/src/app/_components/input-search.tsx
// Don't ask me how the logic works, i just copied it from there
export function IssueListSearchInput({ onSearch }: IssueListSearchInputProps) {
  const searchStr = useSearchParams();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(
    searchStr.get("q")?.toString() ?? "is:open" + " "
  );
  const [currentWord, setCurrentWord] = React.useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearchDebounced = React.useCallback(debounce(onSearch), []);

  const search = {
    sort: SORT_FILTERS,
    in: IN_FILTERS,
    is: STATUS_FILTERS,
    no: NO_METADATA_FILTERS,
  };
  type SearchKey = keyof typeof search;

  return (
    <>
      <Command
        filter={(value) => {
          if (value.includes(currentWord.toLowerCase())) return 1;
          return 0;
        }}
        className="relative"
      >
        <CommandPrimitive.Input
          ref={inputRef}
          name="q"
          value={inputValue}
          onValueChange={(value) => {
            setInputValue(value);
            onSearchDebounced();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") inputRef?.current?.blur();
          }}
          onBlur={() => setMenuOpen(false)}
          onFocus={() => setMenuOpen(true)}
          onInput={(e) => {
            const caretPositionStart = e.currentTarget?.selectionStart || -1;
            const inputValue = e.currentTarget?.value || "";

            let start = caretPositionStart;
            let end = caretPositionStart;

            while (start > 0 && inputValue[start - 1] !== " ") {
              start--;
            }
            while (end < inputValue.length && inputValue[end] !== " ") {
              end++;
            }

            const word = inputValue.substring(start, end);
            setCurrentWord(word);
          }}
          placeholder="Search all issues"
          className={clsx(
            "border-neutral rounded-l-none rounded-r-md border bg-transparent px-3 py-1.5",
            "bg-background shadow-sm ring-accent outline-none w-full",
            "flex-grow text-grey",
            "focus:border focus:border-accent focus:ring-1"
          )}
        />

        <div className="relative">
          {isMenuOpen ? (
            <div className="bg-subtle text-foreground absolute top-2 z-10 w-full rounded-md border shadow-md outline-none border-neutral">
              <CommandGroup className="max-h-64 overflow-auto">
                {Object.keys(search).map((key) => {
                  if (
                    inputValue.includes(`${key}:`) &&
                    !currentWord.includes(`${key}:`)
                  )
                    return null;
                  return (
                    <React.Fragment key={key}>
                      <CommandItem
                        value={key}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={(value) => {
                          setInputValue((prev) => {
                            if (currentWord.trim() === "") {
                              const input = `${prev}${value}`;
                              return `${input}:`;
                            }
                            // lots of cheat
                            const isStarting = currentWord === prev;
                            const prefix = isStarting ? "" : " ";
                            const input = prev.replace(
                              `${prefix}${currentWord}`,
                              `${prefix}${value}`
                            );
                            return `${input}:`;
                          });
                          setCurrentWord(`${value}:`);
                        }}
                        className="group"
                      >
                        {key}
                        <span className="text-foreground/50 ml-1 hidden truncate group-aria-[selected=true]:block">
                          {search[key as SearchKey]
                            .map((str) => `[${str}]`)
                            .join(" ")}
                        </span>
                      </CommandItem>
                      {search[key as SearchKey].map((option) => {
                        return (
                          <SubItem
                            key={option}
                            value={`${key}:${option}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={(value) => {
                              setInputValue((prev) => {
                                const input = prev
                                  .replace(currentWord, value)
                                  .trim();
                                return `${input} `;
                              });

                              setCurrentWord("");
                            }}
                            {...{ currentWord }}
                          >
                            {option}
                          </SubItem>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </CommandGroup>
              <CommandEmpty>No results found.</CommandEmpty>
            </div>
          ) : null}
        </div>
      </Command>
    </>
  );
}

interface SubItemProps
  extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  currentWord: string;
}

const SubItem = ({ currentWord, ...props }: SubItemProps) => {
  const search = useCommandState((state) => state.search);
  if (!search.includes(":") || !currentWord.includes(":")) return null;
  return <CommandItem {...props} />;
};

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={clsx("w-full", className)}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={clsx(
      "text-foreground [&_[cmdk-group-heading]]:text-foreground/50 overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={clsx(
      "aria-selected:bg-accent aria-selected:text-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;
