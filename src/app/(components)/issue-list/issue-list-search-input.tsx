"use client";
import * as React from "react";
// components
import { Command as CommandPrimitive } from "cmdk";

// utils
import { useCommandState } from "cmdk";
import {
  clsx,
  debounce,
  issueSearchFilterToString,
  parseIssueSearchString,
} from "~/lib/shared/utils.shared";
import {
  IN_FILTERS,
  NO_METADATA_FILTERS,
  SORT_FILTERS,
  STATUS_FILTERS,
} from "~/lib/shared/constants";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
import { SearchIcon } from "@primer/octicons-react";

export type IssueListSearchInputProps = {
  onSearch: () => void;
  squaredInputBorder?: boolean;
};

// Inspired by : https://github.com/openstatusHQ/openstatus/blob/main/apps/web/src/app/_components/input-search.tsx
// Don't ask me how the logic works, i just copied it from there
export function IssueListSearchInput({
  onSearch,
  squaredInputBorder,
}: IssueListSearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const {
    query: inputValue,
    setQuery: setInputValue,
    setQueryFromPrevious: setInputValueFromPrevious,
  } = useSearchQueryStore();

  const [currentWord, setCurrentWord] = React.useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearchDebounced = React.useCallback(debounce(onSearch), [onSearch]);

  // TODO : add async data -> for mentions, authors & assignees and  -mentions, -authors & -assignees
  // Reference : https://github.com/pacocoursey/cmdk#asynchronous-results
  const search = {
    sort: { values: SORT_FILTERS, multiple: false },
    in: { values: IN_FILTERS, multiple: true },
    is: { values: STATUS_FILTERS, multiple: false },
    no: { values: NO_METADATA_FILTERS, multiple: true },
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
        <div
          className={clsx(
            "flex items-center gap-1.5",
            "border-neutral rounded-r-md border px-3 py-1.5",
            "bg-black shadow-sm ring-accent outline-none w-full",
            "text-grey",
            "focus-within:border focus-within:border-accent focus-within:ring-1 flex-1",
            {
              "rounded-l-none": squaredInputBorder,
              "rounded-l-md": !squaredInputBorder,
            }
          )}
        >
          <SearchIcon className="h-5 w-5 flex-shrink-0" />
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
              // ✨ Magic ✨
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
            className={clsx("bg-transparent flex-grow outline-none")}
          />
        </div>

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
                          setInputValueFromPrevious((prev) => {
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
                        <span className="text-white/50 ml-1 hidden truncate group-aria-[selected=true]:block">
                          {search[key as SearchKey].values
                            .map((str) => `[${str}]`)
                            .join(" ")}
                        </span>
                      </CommandItem>
                      {search[key as SearchKey].values.map((option) => {
                        return (
                          <SubItem
                            key={option}
                            value={`${key}:${option}`}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={(value) => {
                              setInputValueFromPrevious((prev) => {
                                /**
                                 * @example
                                 * // We add the new value to the input string and remove astray commands so that :
                                 * if (prev === `in:title no:`) {
                                 *     // when we do this
                                 *     (prev + " " + value) = `in:title no: no:label`
                                 *     // and remove the empty `no:` in the middle of the string with the
                                 *     inputWithNewValue = `in:title no:label`
                                 * }
                                 */
                                const inputWithNewValue = (prev + " " + value)
                                  .replace(
                                    new RegExp(`${currentWord}(?=\\s|$)`, "g"),
                                    ""
                                  )
                                  .trim();

                                // We parse then stringify the string to make it valid
                                const filters =
                                  parseIssueSearchString(inputWithNewValue);

                                onSearchDebounced();
                                return issueSearchFilterToString(filters) + " ";
                              });

                              setCurrentWord("");
                            }}
                            currentWord={currentWord}
                          >
                            {option}
                          </SubItem>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </CommandGroup>
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
  <CommandPrimitive.Empty ref={ref} className="py-6 text-center" {...props} />
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
      "aria-selected:bg-accent aria-selected:text-white relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-base outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;
