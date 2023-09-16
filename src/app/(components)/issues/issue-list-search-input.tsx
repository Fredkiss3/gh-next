"use client";
import * as React from "react";
// components
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "@primer/octicons-react";
import { LoadingIndicator } from "~/app/(components)/loading-indicator";

// utils
import { useCommandState } from "cmdk";
import {
  clsx,
  debounce,
  issueSearchFilterToString,
  parseIssueSearchString
} from "~/lib/shared/utils.shared";
import {
  IN_FILTERS,
  NO_METADATA_FILTERS,
  SORT_FILTERS,
  STATUS_FILTERS
} from "~/lib/shared/constants";
import { useSearchQueryStore } from "~/lib/client/hooks/issue-search-query-store";
import { useIssueAuthorListQuery } from "~/lib/client/hooks/use-issue-author-list-query";
import { useIssueAssigneeListQuery } from "~/lib/client/hooks/use-issue-assignee-list-query";
import { useIssueLabelListByNameQuery } from "~/lib/client/hooks/use-issue-label-list-query";

export type IssueListSearchInputProps = {
  onSearch: () => void;
  squaredInputBorder?: boolean;
};

// Inspired by : https://github.com/openstatusHQ/openstatus/blob/main/apps/web/src/app/_components/input-search.tsx
export function IssueListSearchInput({
  onSearch,
  squaredInputBorder
}: IssueListSearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSearchDebounced = React.useCallback(debounce(onSearch), [onSearch]);

  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const {
    query: inputValue,
    setQuery: setInputValue,
    setQueryFromPrevious: setInputValueFromPrevious
  } = useSearchQueryStore();

  const [currentWord, setCurrentWord] = React.useState("");

  // regexes for async filters, they can contain `@` characters
  const authorRegex = /^(-)?author:(\@)?/;
  const assigneeRegex = /^(-)?assignee:(\@)?/;
  const labelListRegex = /^(-)?label:/;

  const { data: authorList, isInitialLoading: isLoadingAuthor } =
    useIssueAuthorListQuery({
      name: currentWord.match(authorRegex)
        ? currentWord.replace(authorRegex, "")
        : "",
      enabled: !!currentWord.match(authorRegex)
    });

  const { data: assigneeList, isInitialLoading: isLoadingAssignee } =
    useIssueAssigneeListQuery({
      name: currentWord.match(assigneeRegex)
        ? currentWord.replace(assigneeRegex, "")
        : "",
      enabled: !!currentWord.match(assigneeRegex)
    });

  const { data: labelList, isInitialLoading: isLoadingLabels } =
    useIssueLabelListByNameQuery({
      name: currentWord.match(labelListRegex)
        ? currentWord.replace(labelListRegex, "")
        : "",
      enabled: !!currentWord.match(labelListRegex)
    });

  const isLoading = isLoadingAuthor || isLoadingAssignee || isLoadingLabels;

  const search = {
    sort: {
      values: SORT_FILTERS,
      getPlaceholder: () => SORT_FILTERS.map((str) => `[${str}]`).join(" ")
    },
    in: {
      values: IN_FILTERS,
      getPlaceholder: () => IN_FILTERS.map((str) => `[${str}]`).join(" ")
    },
    is: {
      values: STATUS_FILTERS,
      getPlaceholder: () => STATUS_FILTERS.map((str) => `[${str}]`).join(" ")
    },
    no: {
      values: NO_METADATA_FILTERS,
      getPlaceholder: () =>
        NO_METADATA_FILTERS.map((str) => `[${str}]`).join(" ")
    },
    author: {
      // this is to fix a bug where results of `-author` also appears for `author`
      values: currentWord.startsWith("-")
        ? []
        : (authorList ?? []).map((user) => user.username),
      getPlaceholder: () => "[Issues with author]"
    },
    "-author": {
      // this is to fix a bug where results of `author` also appears for `-author`
      values: !currentWord.startsWith("-")
        ? []
        : (authorList ?? []).map((user) => user.username),
      getPlaceholder: () => "[Issues without author]"
    },
    assignee: {
      values: currentWord.startsWith("-")
        ? []
        : (assigneeList ?? []).map((user) => user.username),
      getPlaceholder: () => "[Issues with assignees]"
    },
    "-assignee": {
      values: !currentWord.startsWith("-")
        ? []
        : (assigneeList ?? []).map((user) => user.username),
      getPlaceholder: () => "[Issues without assignees]"
    },
    label: {
      values: currentWord.startsWith("-")
        ? []
        : (labelList ?? []).map((label) => label.name),
      getPlaceholder: () => "[Issues with labels]"
    },
    "-label": {
      values: !currentWord.startsWith("-")
        ? []
        : (labelList ?? []).map((label) => label.name),
      getPlaceholder: () => "[Issues without labels]"
    }
  };
  type SearchKey = keyof typeof search;

  return (
    <>
      <Command
        // This is to filter sub items
        filter={(value) => {
          // Special cases for author, mentions & assignee because they can contain `@`
          if (currentWord.match(authorRegex)) {
            return value.match(authorRegex) ? 1 : 0;
          } else if (currentWord.match(assigneeRegex)) {
            return value.match(assigneeRegex) ? 1 : 0;
          } else if (value.includes(currentWord.toLowerCase())) {
            return 1;
          }
          return 0;
        }}
        className="relative"
      >
        <div
          className={clsx(
            "flex flex-1 items-center gap-1.5",
            "rounded-r-md border border-neutral px-3 py-1.5",
            "w-full bg-header shadow-sm outline-none ring-accent",
            "text-grey",
            "focus-within:border focus-within:border-accent focus-within:bg-background focus-within:ring-1",
            {
              "rounded-l-none": squaredInputBorder,
              "rounded-l-md": !squaredInputBorder
            }
          )}
        >
          {isLoading ? (
            <LoadingIndicator className="h-5 w-5 flex-shrink-0" />
          ) : (
            <SearchIcon className="h-5 w-5 flex-shrink-0" />
          )}
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
              // ✨ MAGIC ✨
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
            className={clsx("flex-grow bg-transparent outline-none")}
          />
        </div>

        <div className="relative">
          {isMenuOpen ? (
            <ItemGroupWrapper>
              <CommandGroup className="max-h-64 !overflow-scroll">
                {Object.keys(search).map((key) => {
                  // this is to filter items
                  // only show the item if :
                  // if the input does not contain a query at the end :
                  //  - it not is already in the input
                  //  - or is in the current value
                  // else:
                  //  - the key is in the current value
                  //    ⮑ this is bcose we don't want to show filters if the user is writing a query
                  //       they will still see the filtered values when they manually enter the filters
                  const filters = parseIssueSearchString(inputValue.trim());
                  const queryIsInLastPosition =
                    !!filters.query &&
                    inputValue.trim().endsWith(filters.query.trim());

                  const showItem = queryIsInLastPosition
                    ? currentWord.includes(`${key}:`)
                    : !inputValue.includes(`${key}:`) ||
                      currentWord.includes(`${key}:`);

                  return !showItem ? null : (
                    <React.Fragment key={key}>
                      <CommandItem
                        value={key}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onSelect={(value) => {
                          setInputValueFromPrevious((prev) => {
                            // ✨ MAGIC ✨
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
                        <span className="ml-1 hidden truncate text-white/50 group-aria-[selected=true]:block">
                          {search[key as SearchKey].getPlaceholder()}
                        </span>
                      </CommandItem>
                      {search[key as SearchKey].values.map((option) => {
                        let value = `${key}:${option}`;
                        // labels should be wrapped inside of quotes
                        if (key === "label" || key === "-label") {
                          value = `${key}:"${option}"`;
                        }
                        return (
                          <SubItem
                            key={option}
                            value={value}
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
            </ItemGroupWrapper>
          ) : null}
        </div>
      </Command>
    </>
  );
}

function ItemGroupWrapper({ children }: { children: React.ReactNode }) {
  const filteredCount = useCommandState((state) => state.filtered.count);
  return (
    <div
      className={clsx(
        "absolute top-2 z-10 w-full rounded-md border-neutral bg-subtle text-foreground shadow-md outline-none",
        {
          border: filteredCount > 0
        }
      )}
    >
      {children}
    </div>
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
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-foreground/50",
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
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-base outline-none aria-selected:bg-accent aria-selected:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;
