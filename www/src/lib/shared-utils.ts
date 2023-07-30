import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

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
  return classes.join(" ");
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

export async function jsonFetch<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  // Set the default headers correctly
  const headers: HeadersInit = new Headers(options.headers);
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");

  return fetch(url, {
    ...options,
    headers,
    credentials: "include",
  })
    .then(async (response) => {
      // check if data is JSON
      const isJson =
        response.headers.get("content-type")?.includes("application/json") ??
        false;

      return (await response.json()) as T;
    })
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
 * @param {string} hex The hexadecimal color to convert.
 * @returns {RGBHSLColor | null} An object with the r, g, b, h, s, l values or null if the input is invalid.
 *
 * @example
 * console.log(hexToRGB('#0033ff')); // { r: 0, g: 51, b: 255, h: 240, s: 100, l: 50 }
 * console.log(hexToRGB('03f'));     // { r: 0, g: 51, b: 255, h: 240, s: 100, l: 50 }
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
    l: Math.round(l * 100),
  };
}

/**
 * Generates a random hexadecimal color.
 *
 * @returns {string} A string representing a hexadecimal color.
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
 * @param {Date} date The date to format.
 * @returns {string} The formatted date.
 *
 * @example
 * // Assuming today's date is July 30, 2023
 * formatDate(new Date('2023-07-29T00:00:00Z')); // "1 day ago"
 * formatDate(new Date('2023-07-23T00:00:00Z')); // "1 week ago"
 * formatDate(new Date('2023-06-15T00:00:00Z')); // "6 weeks ago"
 * formatDate(new Date('2023-05-01T00:00:00Z')); // "May 1"
 * formatDate(new Date('2022-05-01T00:00:00Z')); // "May 1, 2022"
 */
export function formatDate(date: Date): string {
  dayjs.extend(relativeTime);
  dayjs.extend(advancedFormat);

  const now = dayjs();
  const diffInMonths = now.diff(date, "month");

  if (diffInMonths < 1) {
    return dayjs().to(date);
  } else {
    const formatString =
      now.year() === date.getFullYear() ? "MMM D" : "MMM D, YYYY";
    return dayjs(date).format(formatString);
  }
}

/**
 * Returns an excerpt of the input string. If the string is longer than `maxChars`,
 * it's cut off and '...' is appended to it.
 *
 * @param {string} str - The string to excerpt.
 * @param {number} maxChars - The maximum number of characters in the excerpt.
 * @returns {string} The excerpted string.
 *
 * @example
 * excerpt("Hello world!", 5); // "Hello..."
 * excerpt("Hello world!", 20); // "Hello world!"
 */
export function excerpt(str: string, maxChars: number): string {
  if (str.length <= maxChars) {
    return str;
  }
  return str.slice(0, maxChars) + "...";
}
