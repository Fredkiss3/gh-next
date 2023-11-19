import { linkWithoutSlash } from "~/lib/shared/utils.shared";
import { NextRequest, NextResponse } from "next/server";
import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME,
  SESSION_COOKIE_KEY
} from "./lib/shared/constants";
import { Session } from "./lib/server/session.server";
import isbot from "isbot";

export default async function middleware(request: NextRequest) {
  // Ignore images in PUBLIC FOLDER
  if (
    request.nextUrl.pathname.endsWith("png") ||
    request.nextUrl.pathname.endsWith("svg")
  ) {
    return NextResponse.next();
  }

  // TODO : we have to remove this when these pages will be implemented
  if (request.nextUrl.pathname === "/") {
    return NextResponse.redirect(
      new URL(
        `/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/`,
        request.url
      )
    );
  }
  if (request.nextUrl.pathname === "/issues") {
    return NextResponse.redirect(
      new URL(
        `/${GITHUB_AUTHOR_USERNAME}/${GITHUB_REPOSITORY_NAME}/issues?${request.nextUrl.searchParams.toString()}`,
        request.url
      )
    );
  }

  let isRequestModified = false;

  // Ensure a session is attached to each user
  const sessionId = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  let session = sessionId ? await Session.get(sessionId) : null;
  const isBot = isbot(request.headers.get("User-Agent"));
  if (!session) {
    session = await Session.create(isBot);
    request.cookies.set(session.getCookie());
    isRequestModified = true;
  }

  // Extends expiration time on first load and not on link navigation
  // only if the request doesn't come from a bot
  if (request.headers.get("accept")?.includes("text/html") && !isBot) {
    try {
      await session.extendValidity();
    } catch (error) {
      session = await Session.create();
    } finally {
      request.cookies.set(session.getCookie());
      isRequestModified = true;
    }
  }

  // Pass method to headers so that it is accessible within components
  const headers = new Headers(request.headers);
  headers.set("x-method", request.method.toUpperCase());

  const pathname = request.nextUrl.pathname;

  // Check if there is any supported locale in the pathname
  const pathnameIsMissingTheme = ["light", "dark", "system"].every(
    (theme) => !pathname.startsWith(`/${theme}/`) && pathname !== `/${theme}`
  );

  const currentTheme = session.user?.preferred_theme ?? "system";

  let response: NextResponse;
  if (pathnameIsMissingTheme) {
    response = NextResponse.rewrite(
      new URL(
        `/${currentTheme}/${linkWithoutSlash(pathname, "start")}`,
        request.url
      ),
      {
        request: {
          headers
        }
      }
    );
  } else {
    // the pathname will be split like this : ['' , 'dark', 'Fredkiss3', 'gh-next' ]
    // so we remove the two 1st items in the path to get the rest of the path
    // and remove the theme from the path
    const [_, _theme, ...rest] = pathname.split("/");

    response = NextResponse.redirect(
      new URL("/" + rest.join("/"), request.url),
      {
        headers
      }
    );
  }

  if (isRequestModified) {
    response.cookies.set(session.getCookie());
  }

  return response;
}

export const config = {
  // dont match `_next`, `api` routes or static paths
  matcher: [
    "/((?!_next/static|_next/image|api|favicon.ico|fonts|opengraph-image*|robots.txt|sitemap.xml).*)"
  ]
};
