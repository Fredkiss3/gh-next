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
 *      // => [1, 2, 3, 4]
 * @param start
 * @param end
 * @returns
 */
export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => i + start);
}

export function getCookieValue(cookieName: string) {
  // Split all cookies into an array
  var cookies = document.cookie.split(";");

  // Loop through the cookies
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();

    // Check if the cookie starts with the given name
    if (cookie.indexOf(cookieName + "=") === 0) {
      // Extract and return the cookie value
      return cookie.substring(cookieName.length + 1);
    }
  }

  // Return null if the cookie is not found
  return null;
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
