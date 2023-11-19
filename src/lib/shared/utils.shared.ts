import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { preprocess, z } from "zod";
import {
  IN_FILTERS,
  NO_METADATA_FILTERS,
  REASON_FILTERS,
  SORT_FILTERS,
  STATUS_FILTERS
} from "./constants";
import { twMerge } from "tailwind-merge";

/**
 * Petit utilitaire pour chainer les classes css en react tout en évitant
 *  les "false" et "null" dans les classes.
 *
 *  @example
 *    const classes = clsx(
 *        "class1",
 *        "class2",
 *        undefined,
 *        {
 *          class3: true,
 *          class4: false,
 *        });
 *     // retournera "class1 class2 class3"
 *
 * @param args
 */
export function clsx(
  ...args: (string | undefined | Record<string, boolean | undefined>)[]
): string {
  const classes: string[] = [];
  for (const arg of args) {
    switch (typeof arg) {
      case "string":
        if (arg) {
          classes.push(arg);
        }
        break;
      case "object":
        if (arg) {
          for (const key in arg) {
            if (arg[key]) {
              classes.push(key);
            }
          }
        }
        break;
    }
  }
  return twMerge(classes.join(" "));
}

/**
 * Generate an array of numbers from start to the end
 *
 * @example
 *      range(1, 5);
 *      // => [1, 2, 3, 4, 5]
 * @param start
 * @param end
 * @returns
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export function wait(ms: number): Promise<void> {
  // Wait for the specified amount of time
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a URL is a valid pathname
 * @param url
 * @param base
 * @returns
 */
export function isValidURLPathname(url: any): url is string {
  try {
    const _ = new URL(url, "http://localhost");
    return url.startsWith("/") && true;
  } catch (_) {
    return false;
  }
}

/**
 * Adds a `/` at the end of a path if it does not already contains it
 * @param href
 * @returns
 */
export function linkWithSlash(href: string) {
  if (href.endsWith("/")) {
    return href;
  }
  return href + "/";
}

/**
 * Remove a `/` at the end of a path if it contains it
 * @param href
 * @returns
 */
export function linkWithoutSlash(
  href: string,
  trimPosition: "start" | "end" | "both" = "end"
) {
  let modifiedHref = href;

  if (trimPosition === "start" || trimPosition === "both") {
    if (href.startsWith("/")) {
      modifiedHref = modifiedHref.substring(1);
    }
  }

  if (trimPosition === "end" || trimPosition === "both") {
    if (href.endsWith("/")) {
      modifiedHref = modifiedHref.substring(0, href.length - 1);
    }
  }

  return modifiedHref;
}

export async function jsonFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Set the default headers correctly
  const headers: HeadersInit = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  // do not cache mutative methods (POST, PUT, DELETE) by default, unless if explicitly cached
  if (
    !options.cache &&
    ["POST", "PUT", "DELETE"].includes(options.method ?? "GET")
  ) {
    options.cache = "no-store";
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: "include"
  })
    .then((response) => response.json() as Promise<T>)
    .catch((error) => {
      console.error(
        `[jsonFetch ${options.method ?? "GET"} ${url}] There was an error :`,
        error
      );
      throw error;
    });
}

export type RGBHSLColor = {
  r: number;
  g: number;
  b: number;
  h: number;
  s: number;
  l: number;
};

/**
 * Converts a hex color to an object with RGB and HSL values.
 *
 * @param hex The hexadecimal color to convert.
 * @returns An object with the r, g, b, h, s, l values or null if the input is invalid.
 *
 * @example
 * console.log(hexToRGBHSL('#0033ff')); // { r: 0, g: 51, b: 255, h: 240, s: 100, l: 50 }
 * console.log(hexToRGBHSL('03f'));     // { r: 0, g: 51, b: 255, h: 240, s: 100, l: 50 }
 */
export function hexToRGBHSL(hex: string): RGBHSLColor | null {
  let sanitizedHex = hex.startsWith("#") ? hex.slice(1) : hex;

  if (sanitizedHex.length === 3) {
    sanitizedHex = sanitizedHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (sanitizedHex.length !== 6) {
    console.error("Invalid HEX color.");
    return null;
  }

  const r = parseInt(sanitizedHex.slice(0, 2), 16);
  const g = parseInt(sanitizedHex.slice(2, 4), 16);
  const b = parseInt(sanitizedHex.slice(4, 6), 16);

  const rPerc = r / 255;
  const gPerc = g / 255;
  const bPerc = b / 255;

  const max = Math.max(rPerc, gPerc, bPerc);
  const min = Math.min(rPerc, gPerc, bPerc);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rPerc:
        h = (gPerc - bPerc) / d + (gPerc < bPerc ? 6 : 0);
        break;
      case gPerc:
        h = (bPerc - rPerc) / d + 2;
        break;
      case bPerc:
        h = (rPerc - gPerc) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    r,
    g,
    b,
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Generates a random hexadecimal color.
 *
 * @returns A string representing a hexadecimal color.
 * @example
 *  console.log(getRandomHexColor());  // Example output: "#3e4f5c"
 */
export function getRandomHexColor(): string {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
}

/**
 * Formats a date. If the date is in the current year, omits the year. If the date
 * is less or equal than a month ago, returns the date relative to now. Otherwise,
 * returns the date in the format "MMM d".
 *
 * @param date The date to format.
 * @returns The formatted date.
 *
 * @example
 * // Assuming today's date is July 30, 2023
 * formatDate(new Date('2023-07-29T00:00:00Z')); // "1 day ago"
 * formatDate(new Date('2023-07-23T00:00:00Z')); // "1 week ago"
 * formatDate(new Date('2023-06-15T00:00:00Z')); // "6 weeks ago"
 * formatDate(new Date('2023-05-01T00:00:00Z')); // "on May 1"
 * formatDate(new Date('2022-05-01T00:00:00Z')); // "on May 1, 2022"
 */
export function formatDate(date: Date | string): string {
  date = new Date(date);
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const now = dayjs();
  const diffInMonths = now.diff(date, "month");

  if (diffInMonths < 1) {
    return dayjs().to(date);
  } else {
    const formatString =
      now.year() === date.getFullYear() ? "MMM D" : "MMM D, YYYY";
    return "on " + dayjs(date).format(formatString);
  }
}

/**
 * Returns an excerpt of the input string. If the string is longer than `maxChars`,
 * it's cut off and '...' is appended to it.
 *
 * @param str - The string to excerpt.
 * @param maxChars - The maximum number of characters in the excerpt.
 * @returns The excerpted string.
 *
 * @example
 * getExcerpt("Hello world!", 5); // "Hello..."
 * getExcerpt("Hello world!", 20); // "Hello world!"
 */
export function getExcerpt(str: string, maxChars: number): string {
  if (str.length <= maxChars) {
    return str;
  }
  return str.slice(0, maxChars) + "...";
}

const issueSearchFiltersSchema = z.object({
  in: preprocess(
    (arg) => {
      if (Array.isArray(arg)) {
        return new Set(arg);
      }
      return arg;
    },
    z.set(z.enum(IN_FILTERS)).catch(new Set(IN_FILTERS)).nullish()
  ),
  is: z.enum(STATUS_FILTERS).default("open").nullish().catch(null),
  reason: z.enum(REASON_FILTERS).nullish().catch(null),
  no: preprocess(
    (arg) => {
      if (Array.isArray(arg)) {
        return [...new Set(arg)];
      }
      return arg;
    },
    z.array(z.enum(NO_METADATA_FILTERS)).catch([]).default([]).nullish()
  ),
  label: z.array(z.string()).catch([]).default([]).nullish(),
  "-label": z.array(z.string()).catch([]).default([]).nullish(),
  assignee: z.array(z.string()).catch([]).default([]).nullish(),
  "-assignee": z.array(z.string()).catch([]).default([]).nullish(),
  author: z.string().nullish(),
  "-author": z.string().nullish(),
  mentions: z.string().nullish(),
  "-mentions": z.string().nullish(),
  sort: z
    .enum(SORT_FILTERS)
    .default("created-desc")
    .nullish()
    .catch("created-desc"),
  query: z.string().nullish()
});

export type IssueSearchFilters = z.infer<typeof issueSearchFiltersSchema>;

/**
 * Parses a search query string and extracts issue filter tokens.
 *
 * Given a string with tokens separated by spaces, this function identifies
 * and extracts issue-related filters such as 'is', 'in', 'label', 'assignee',
 * 'mentions', 'query', and 'sort'. The extracted filters are then returned
 * as an `IssueSearchFilters` object.
 *
 * This function was designed with assistance from CHATGPT. While the underlying
 * regex has been tested to work as expected, it may be beneficial to review
 * its logic for comprehensive understanding.
 *
 * @param input A string containing issue search tokens and criteria.
 * @returns An `IssueSearchFilters` object representing the extracted filters.
 *
 * @example
 * const testString = 'is:open is:closed in:title in:body label:"area: app" label:"linear: next" assignee:fredkiss3,sebmarkbage mentions:@me,@fredkiss3 hello world how you doing ? sort:comments-asc,comments-desc';
 * const result = parseIssueFilterTokens(testString);
 * // Expected output:
 * // {
 * //   "is": "closed",
 * //   "in": ["title", "body"],
 * //   "label": ["area: app", "linear: next"],
 * //   "assignee": ["fredkiss3", "sebmarkbage"],
 * //   "mentions": "fredkiss3",
 * //   "query": "hello world how you doing ?",
 * //   "sort": "comments-desc"
 * // }
 */
export function parseIssueFilterTokens(input: string): IssueSearchFilters {
  const result: Record<string, string[] | string> = {};

  // Splitting while considering quotes
  const parts = input.match(/(?:[^\s"]+|"[^"]*")+|("[^"]*)/g) || [];

  for (const part of parts) {
    // Splitting on the first colon only
    let [key, ...valueParts] = part.split(":");
    let value = valueParts.join(":").trim(); //.replace(/"/g, "");

    // replace starting & ending quotes with empty
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }

    // we want to consider lone `key:` as in the query
    // so that people can search for them
    if (!value) {
      key = "query";
    }

    switch (key) {
      // Multiple filters
      case "in":
      case "no":
      case "label":
      case "-label":
      case "assignee":
      case "-assignee": {
        const values = value.split(",").map((v) => v.trim());
        if (result[key]) {
          result[key] = [...result[key]!, ...values];
        } else {
          result[key] = values;
        }
        break;
      }

      // Single filters
      case "is":
      case "reason":
      case "author":
      case "-author":
      case "mentions":
      case "-mentions":
      case "sort": {
        const values = value.split(",").map((v) => v.trim());
        result[key] = values[values.length - 1];
        break;
      }
      default:
        result.query = result.query ? result.query + " " + part : part;
        break;
    }
  }

  return issueSearchFiltersSchema.parse(result);
}

/**
 * Formats an `IssueSearchFilters` object into a string representation.
 *
 * This function takes an `IssueSearchFilters` object, representing various
 * search criteria, and converts it into a string format suitable for
 * display and transmission to the server. The resulting string is composed
 * of tokens and values that represent the different filters and their specified
 * criteria.
 *
 * @param filters An `IssueSearchFilters` object containing search criteria.
 * @returns A string representation of the provided search filters.
 *
 * @example
 * const filters = {
 *   "is": "closed",
 *   "in": ["title", "body"],
 *   "label": ["area: app", "linear: next"],
 *   "assignee": ["fredkiss3", "sebmarkbage"],
 *   "mentions": "@fredkiss3",
 *   "query": "hello world how you doing ?",
 *   "sort": "comments-desc"
 * };
 * const resultString = formatSearchFiltersToString(filters);
 * // Expected output:
 * // 'is:closed in:title in:body label:"area: app" label:"linear: next" assignee:fredkiss3 assignee:sebmarkbage mentions:@fredkiss3 sort:comments-desc hello world how you doing ?'
 */
export function formatSearchFiltersToString(
  filters: IssueSearchFilters
): string {
  let terms: string[] = [];
  for (const key in filters) {
    let value = filters[key as keyof IssueSearchFilters];
    if (key === "query") {
      continue;
    }
    if (key === "no" && Array.isArray(value)) {
      // @ts-expect-error this is fine, typescript infer this as string[] | ("label" | "assignee")[]
      // but this value can only be "label" | "assignee"
      value = new Set(value);
    }

    // For labels, wrap them inside quotes
    if (Array.isArray(value)) {
      for (const item of value) {
        if (key === "label" || key === "-label") {
          terms.push(`${key}:"${item}"`);
        } else {
          terms.push(`${key}:${item}`);
        }
      }
    }
    // TODO : handle "or" conditions
    //  else if (Array.isArray(value) && value.length > 0) {
    //   terms.push(key + ":" + value.join(","));
    // }
    else if (typeof value === "string") {
      terms.push(`${key}:${value}`);
    } else if (value instanceof Set && value.size > 0) {
      for (const item of value) {
        terms.push(`${key}:${item}`);
      }
      // TODO : handle "or" conditions
      // terms.push(key + ":" + [...value].join(","));
    }
  }

  if (filters["query"]) {
    terms.push(filters["query"]);
  }

  return terms.join(" ");
}

/**
 * Creates a debounced version of the provided function. The debounced function will delay the invocation
 * of the original function until after a specified number of milliseconds have elapsed since the last time
 * the debounced function was invoked.
 *
 * @param callback - The function to debounce.
 * @param delay - The number of milliseconds to delay the invocation. **Defaults to 500ms**.
 *
 * @returns Returns the debounced version of the passed function.
 *
 * @example
 *    const debouncedLog = debounce(() => console.log("LOGGED"))
 *
 *    debouncedLog()
 *    debouncedLog()
 *    debouncedLog() // only this one will be logged
 *
 */
export function debounce(callback: Function, delay: number = 500) {
  let timer: number | undefined;
  return (...args: any[]) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      // @ts-expect-error typescript complain because of `this` and idk why
      callback.apply(this, args);
    }, delay);
  };
}

/**
 * Pluralize a string
 * @example
 *  pluralize('issue', 0) // returns issue
 *  pluralize('issue', 1) // returns issue
 *  pluralize('issue', 2) // returns issues
 */
export function pluralize(str: string, count: number) {
  return str + (count > 1 ? "s" : "");
}

/**
 * Paginates an array in reverse order.
 *
 * @param arr - The array to paginate.
 * @param page - The page number (1-based index).
 * @param pageSize - The number of items per page.
 * @returns - A new array containing the paginated items in reverse order.
 *
 * @example
 * const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const page = 1;
 * const pageSize = 3;
 * const paginatedArr = reversePaginate(arr, page, pageSize);
 * console.log(paginatedArr);  // Output should be [10, 9, 8]
 */
export function reversePaginate<T>(
  arr: T[],
  page: number,
  pageSize: number
): T[] {
  const totalItems = arr.length;

  // Calculate the start and end indices for slicing
  let endIdx = totalItems - (page - 1) * pageSize;
  const startIdx = endIdx - pageSize > 0 ? endIdx - pageSize : 0;

  // Don't paginate outside of the array
  if (endIdx < 0) {
    endIdx = 0;
  }

  // Slice the array from end towards the beginning
  return arr.slice(startIdx, endIdx).reverse();
}

/**
 * Splits an array into chunks of a specified size.
 *
 * This function takes an array and divides it into multiple sub-arrays,
 * each of the specified size. If the array cannot be divided evenly,
 * the final chunk will contain the remaining elements. The function
 * throws an error if the chunk size is less than or equal to zero.
 *
 * @param {T[]} array - The array to be chunked. It can be of any type.
 * @param {number} chunkSize - The size of each chunk. Must be a positive integer.
 * @returns {T[][]} An array of chunked arrays. Each sub-array is a chunk of the original array.
 *
 * @example
 * // Example usage
 * const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
 * const chunked = chunkArray(numbers, 3);
 * console.log(chunked);
 * // Output: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]
 *
 * @throws {Error} If the chunk size is less than or equal to zero.
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  // Check if the chunk size is valid
  if (chunkSize <= 0) {
    throw new Error("Chunk size must be greater than 0");
  }

  // The result array of chunks
  const chunkedArray: T[][] = [];

  // Loop through the array and slice it into chunks
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    chunkedArray.push(chunk);
  }

  return chunkedArray;
}
