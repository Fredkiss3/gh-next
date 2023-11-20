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
  formatSearchFiltersToString,
  parseIssueFilterTokens
} from "~/lib/shared/utils.shared";
import {
  IN_FILTERS,
  NO_METADATA_FILTERS,
  REASON_FILTERS,
  SORT_FILTERS,
  STATUS_FILTERS
} from "~/lib/shared/constants";
import { useIssueAuthorListQuery } from "~/lib/client/hooks/use-issue-author-list-query";
import { useIssueAssigneeListQuery } from "~/lib/client/hooks/use-issue-assignee-list-query";
import { useIssueLabelListByNameQuery } from "~/lib/client/hooks/use-issue-label-list-query";
import { useSearchInputTokens } from "~/lib/client/hooks/use-search-input-tokens";

export type IssueListSearchInputProps = {
  onSearch: () => void;
  searchQuery: string | null;
  squaredInputBorder?: boolean;
};

// Inspired by : https://github.com/openstatusHQ/openstatus/blob/main/apps/web/src/app/_components/input-search.tsx
export function IssueListSearchInput({
  onSearch,
  squaredInputBorder,
  searchQuery
}: IssueListSearchInputProps) {
  const inputRef = React.useRef<React.ElementRef<"input">>(null);
  const sizerRef = React.useRef<React.ElementRef<"div">>(null);
  const inputTokensRef = React.useRef<React.ElementRef<"div">>(null);

  const [isFirstRender, setIsFirstRender] = React.useState(true);

  const [isMenuOpen, setMenuOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(() => {
    let defaultSearch = "is:open ";

    if (searchQuery !== null) {
      // add a space at the end of the input so that
      // autocomplete for search filters does not pick up the value from the input
      if (!searchQuery.endsWith(" ")) {
        defaultSearch = searchQuery + " ";
      } else {
        defaultSearch = searchQuery;
      }
    }

    return defaultSearch;
  });
  const [currentWord, setCurrentWord] = React.useState("");

  const searchTokens = useSearchInputTokens(inputValue);
  const searchTokensInInput = useSearchInputTokens(inputValue, true);

  const authorRegex = /^(-)?author:/;
  const assigneeRegex = /^(-)?assignee:/;
  const labelListRegex = /^(-)?label:/;

  const { data: authorList, isLoading: isLoadingAuthor } =
    useIssueAuthorListQuery({
      name: currentWord.match(authorRegex)
        ? currentWord.replace(authorRegex, "")
        : "",
      enabled: !!currentWord.match(authorRegex)
    });

  const { data: assigneeList, isLoading: isLoadingAssignee } =
    useIssueAssigneeListQuery({
      name: currentWord.match(assigneeRegex)
        ? currentWord.replace(assigneeRegex, "")
        : "",
      enabled: !!currentWord.match(assigneeRegex)
    });

  const { data: labelList, isLoading: isLoadingLabels } =
    useIssueLabelListByNameQuery({
      name: currentWord.match(labelListRegex)
        ? currentWord.replace(labelListRegex, "")
        : "",
      enabled: !!currentWord.match(labelListRegex)
    });

  const isLoading = isLoadingAuthor || isLoadingAssignee || isLoadingLabels;

  const searchFilters = {
    sort: {
      groupTitle: "Sorting criteria",
      values: SORT_FILTERS
    },
    in: {
      groupTitle: "Search in",
      values: IN_FILTERS
    },
    is: {
      groupTitle: "States",
      values: STATUS_FILTERS
    },
    reason: {
      groupTitle: "Closing reasons",
      values: REASON_FILTERS
    },
    no: {
      groupTitle: "Values",
      values: NO_METADATA_FILTERS
    },
    author: {
      // this is to fix a bug where results of `-author` also appears for `author`
      groupTitle: "Included author",
      values: currentWord.startsWith("-")
        ? []
        : (authorList ?? []).map((user) => user.username)
    },
    "-author": {
      // this is to fix a bug where results of `author` also appears for `-author`
      groupTitle: "Excluded author",
      values: !currentWord.startsWith("-")
        ? []
        : (authorList ?? []).map((user) => user.username)
    },
    assignee: {
      groupTitle: "Included assignees",
      values: currentWord.startsWith("-")
        ? []
        : (assigneeList ?? []).map((user) => user.username)
    },
    "-assignee": {
      groupTitle: "Excluded assignees",
      values: !currentWord.startsWith("-")
        ? []
        : (assigneeList ?? []).map((user) => user.username)
    },
    label: {
      groupTitle: "Included labels",
      values: currentWord.startsWith("-")
        ? []
        : (labelList ?? []).map((label) => label.name)
    },
    "-label": {
      groupTitle: "Excluded labels",
      values: !currentWord.startsWith("-")
        ? []
        : (labelList ?? []).map((label) => label.name)
    }
  };
  type SearchKey = keyof typeof searchFilters;

  let groupHeadingTitle = "Suggested filters";
  // get the current selected key derived from the current word
  if (currentWord.includes(":")) {
    const key = currentWord.replace(/(\:[a-zA-Z0-9 ]*)/, "");
    const groupTitle = searchFilters[key as SearchKey]?.groupTitle;
    if (groupTitle) {
      groupHeadingTitle = groupTitle;
    }
  }

  React.useEffect(() => {
    setIsFirstRender(false);
  }, []);

  const resizeAndScrollTokenInputs = React.useCallback((inputValue: string) => {
    if (sizerRef.current && inputRef.current && inputTokensRef.current) {
      // set the content of the sizer
      sizerRef.current.textContent = "";

      if (
        inputRef.current.selectionStart !== null &&
        inputRef.current.selectionStart === inputRef.current.selectionEnd
      ) {
        // insert an element where the cursor should be so we can find it
        const index = inputRef.current.selectionStart;
        const cursor = document.createElement("span");

        sizerRef.current.append(inputValue.substring(0, index));
        sizerRef.current.appendChild(cursor);
        sizerRef.current.append(inputValue.substring(index));
      } else {
        sizerRef.current.textContent = inputValue;
      }

      const minWidth = 0;
      const cursor = sizerRef.current.querySelector("span");
      const inputContainer = inputTokensRef.current.parentElement!;

      if (cursor) {
        // make sure the cursor is visible
        if (cursor.offsetLeft < inputContainer.scrollLeft) {
          // overflow left
          inputContainer.scrollLeft = cursor.offsetLeft - minWidth;
        } else if (
          cursor.offsetLeft >=
          inputContainer.scrollLeft + inputContainer.clientWidth
        ) {
          // overflow right
          inputContainer.scrollLeft =
            cursor.offsetLeft - inputContainer.clientWidth + minWidth;
        }
      }

      const currentSizerScrollWidth = sizerRef.current.scrollWidth;
      const newInputWidth = Math.max(
        currentSizerScrollWidth + 2,
        inputValue === "" ? 2 : 0,
        minWidth
      );

      inputRef.current.style.width = `${newInputWidth}px`;
    }
  }, []);

  React.useEffect(() => {
    resizeAndScrollTokenInputs(inputValue);
  }, [inputValue, resizeAndScrollTokenInputs]);

  return (
    <>
      <Command
        label="Search all issues"
        // This is to filter sub items
        filter={(value) => {
          if (value === "search:submit") {
            return 1; // always show the `search` command item
          }

          // this is to match the case of keys like `-label` or `-assignee`
          // we strip the `-` and check if it matches the current word,
          // if so, then we want to show the filter
          const negativeKey = value.substring(1);

          // Special cases for author, mentions & assignee because they can contain `@`
          if (currentWord.match(authorRegex)) {
            return value.match(authorRegex) ? 1 : 0;
          } else if (currentWord.match(assigneeRegex)) {
            return value.match(assigneeRegex) ? 1 : 0;
          } else if (
            value.startsWith(currentWord.toLowerCase()) ||
            (negativeKey in searchFilters &&
              negativeKey.startsWith(currentWord.toLowerCase()))
          ) {
            return 1;
          }
          return 0;
        }}
        className="relative min-w-0"
      >
        <div
          className={clsx(
            "flex items-center gap-1.5 overflow-x-auto hide-scrollbars min-w-0",
            "rounded-r-md border border-neutral px-3 py-1.5",
            "w-full bg-header shadow-sm outline-none ring-accent font-medium max-w-full",
            "text-foreground",
            "focus-within:border focus-within:border-accent focus-within:bg-background focus-within:ring-1",
            {
              "rounded-l-none": squaredInputBorder,
              "rounded-l-md": !squaredInputBorder
            }
          )}
        >
          {isLoading ? (
            <LoadingIndicator className="h-5 w-5 flex-shrink-0 text-grey" />
          ) : (
            <SearchIcon className="h-5 w-5 flex-shrink-0 text-grey" />
          )}
          <div
            className="flex w-full relative overflow-x-auto max-w-full hide-scrollbars"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Search Tokens  */}
            <div
              ref={inputTokensRef}
              className={clsx(
                "absolute select-none whitespace-pre break-words p-0 overflow-y-hidden overflow-x-auto hide-scrollbars",
                "inline-flex",
                {
                  hidden: isFirstRender
                }
              )}
              aria-hidden="true"
            >
              {searchTokensInInput}
            </div>

            <div className="w-full self-stretch">
              {/* Sizer to get the size of the tokens */}
              <div
                id="sizer"
                className="absolute top-0 left-0 h-0 overflow-scroll whitespace-pre invisible hide-scrollbars"
                aria-hidden="true"
                ref={sizerRef}
              />

              {/* Rendered input */}
              <CommandPrimitive.Input
                ref={inputRef}
                name="q"
                value={inputValue}
                onValueChange={(value) => {
                  setInputValue(value);
                }}
                className={clsx(
                  "p-0 bg-transparent outline-none min-w-full overflow-y-hidden overflow-x-auto",
                  "relative z-10 caret-foreground hide-scrollbars resize-none",
                  {
                    "text-transparent": !isFirstRender
                  }
                )}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    inputRef?.current?.blur();
                  }
                }}
                onBlur={() => setMenuOpen(false)}
                onFocus={() => setMenuOpen(true)}
                onInput={(e) => {
                  // ✨ MAGIC ✨
                  const caretPositionStart =
                    e.currentTarget?.selectionStart || -1;
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
              />
            </div>
          </div>
        </div>

        <div className="relative">
          {isMenuOpen && (
            <ItemGroupWrapper className="">
              <CommandPrimitive.List>
                {/* Don't show the current search values if the input is empty */}
                {inputValue.trim().length > 0 && (
                  <CommandGroup heading="Search">
                    <CommandItem
                      className="flex justify-between items-baseline"
                      value="search:submit"
                      key="search:submit"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={() => {
                        onSearch();
                      }}
                    >
                      <div className="inline-flex items-baseline gap-2">
                        <SearchIcon className="text-grey h-5 w-5 flex-shrink-0 relative top-1.5" />
                        <p>{searchTokens}</p>
                      </div>
                      <span className="text-grey text-sm whitespace-nowrap">
                        Submit search
                      </span>
                    </CommandItem>
                  </CommandGroup>
                )}

                <CommandGroup
                  className="max-h-64 !overflow-auto border-t border-neutral"
                  heading={groupHeadingTitle}
                >
                  {Object.keys(searchFilters).map((key) => {
                    // this is to filter search filters
                    // only show the item if the key is in the current value
                    const showItem =
                      !inputValue.includes(`${key}:`) ||
                      currentWord.includes(`${key}:`);

                    return (
                      showItem && (
                        <React.Fragment key={key}>
                          <CommandItem
                            value={key}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onSelect={(value) => {
                              setInputValue((prev) => {
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
                            className="group justify-between"
                          >
                            <span>{key}:</span>
                            <span className="text-grey text-sm">
                              Autocomplete
                            </span>
                          </CommandItem>

                          {searchFilters[key as SearchKey].values.map(
                            (option) => {
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
                                    setInputValue((prev) => {
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
                                      const inputWithNewValue = (
                                        prev +
                                        " " +
                                        value
                                      )
                                        .replace(
                                          new RegExp(
                                            `${currentWord}(?=\\s|$)`,
                                            "g"
                                          ),
                                          ""
                                        )
                                        .trim();

                                      // We parse then stringify the string to make it valid
                                      const filters =
                                        parseIssueFilterTokens(
                                          inputWithNewValue
                                        );

                                      return (
                                        formatSearchFiltersToString(filters) +
                                        " "
                                      );
                                    });
                                    setCurrentWord("");
                                  }}
                                  currentWord={currentWord}
                                  className="justify-between"
                                >
                                  <span>{option}</span>
                                  <span className="text-grey text-sm">
                                    Autocomplete
                                  </span>
                                </SubItem>
                              );
                            }
                          )}
                        </React.Fragment>
                      )
                    );
                  })}
                </CommandGroup>
              </CommandPrimitive.List>
            </ItemGroupWrapper>
          )}
        </div>
      </Command>
    </>
  );
}

function ItemGroupWrapper({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const filteredCount = useCommandState((state) => state.filtered.count);
  return (
    <div
      className={clsx(
        "absolute top-2 z-10 w-full rounded-xl border-neutral bg-subtle text-foreground shadow-md outline-none",
        {
          border: filteredCount > 0
        },
        className
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
      "overflow-hidden text-foreground py-3 px-2.5",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-grey",
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
      "relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-base outline-none",
      "aria-selected:bg-neutral/40 aria-selected:text-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "aria-selected:before:absolute aria-selected:before:-left-1",
      "aria-selected:before:h-6 aria-selected:before:w-1 aria-selected:before:rounded-md aria-selected:before:bg-accent",
      "aria-selected:before:top-[53%] aria-selected:before:translate-y-[-55%]",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;
