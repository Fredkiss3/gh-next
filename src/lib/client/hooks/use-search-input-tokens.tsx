import * as React from "react";
import {
  parseIssueFilterTokens,
  type IssueSearchFilters
} from "~/lib/shared/utils.shared";

/**
 * transform a search input into tokens html tokens
 * @param input the search string
 * @param useHTMLSpace wether to replace spaces with the html entity `&nbsp;`
 * @returns
 */
export function useSearchInputTokens(
  input: string,
  useHTMLSpace: boolean = false
) {
  return React.useMemo(() => {
    const terms: React.ReactNode[] = [];
    let index = 0;

    // Splitting while considering quotes
    const parts = input.match(/(?:[^\s"]+|"[^"]*")+|( )|("[^"]*)/g) || [];

    for (const part of parts) {
      index++;
      // Splitting on the first colon only
      let [key, ...valueParts] = part.split(":");
      const value = valueParts.join(":");

      // don't highlight values that not formatted correctly
      let isValueValid = true;

      if (["author", "assignees", "mentions"].includes(key)) {
        isValueValid = !!value.match(/(^(\@)?[\w-]+$)/);
      }

      let isValidFilterValue = true;

      if (isValueValid) {
        const parsed = parseIssueFilterTokens(part);

        isValidFilterValue = key in parsed;
        if (isValidFilterValue) {
          const filterValue = parsed[key as keyof IssueSearchFilters]!;

          if (typeof filterValue === "string") {
            isValidFilterValue = value.trim() === filterValue;
          } else if (Array.isArray(filterValue)) {
            isValidFilterValue = filterValue.includes(
              // @ts-expect-error
              value
            );
          } else if (filterValue instanceof Set) {
            // @ts-expect-error
            isValidFilterValue = filterValue.has(value);
          } else if (filterValue === null || filterValue === undefined) {
            isValidFilterValue = false;
          }
        }
      }

      // we want to consider lone `key:` as in the query
      // so that people can search for them
      if (!value || !isValueValid || !isValidFilterValue) {
        key = "query";
      }
      switch (key) {
        // Valid filters
        case "label":
        case "-label":
        case "in":
        case "no":
        case "assignee":
        case "-assignee":
        case "is":
        case "reason":
        case "author":
        case "-author":
        case "mentions":
        case "-mentions":
        case "sort": {
          terms.push(<SearchKey key={`${key}-${index}`} value={key} />);
          terms.push(<SearchToken value={value} key={`${value}-${index}`} />);
          break;
        }
        default: {
          terms.push(
            <span key={`${key}-${index}`} className="text-foreground break-all">
              {part === " " && useHTMLSpace ? <>&nbsp;</> : part}
            </span>
          );
          break;
        }
      }
    }

    return terms;
  }, [input, useHTMLSpace]);
}

function SearchToken({ value }: { value: string }) {
  return (
    <span className="inline-block text-accent bg-accent/10 rounded-md">
      {value}
    </span>
  );
}

function SearchKey({ value }: { value: string }) {
  return <span className="inline-block text-foreground">{value}:</span>;
}
