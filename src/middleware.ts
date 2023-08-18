import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_KEY } from "./lib/constants";
import { Session } from "./lib/session";
import isbot from "isbot";

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Set the cookies on request + response so that
 * it is immediatly accessible when calling `cookies()`
 * and the cookie is set for subsequent requests
 * @param request
 * @param cookie
 * @returns
 */
function setRequestAndResponseCookies(
  request: NextRequest,
  cookie: ResponseCookie
) {
  request.cookies.set({
    name: cookie.name,
    value: cookie.value,
  });

  const response = NextResponse.next({
    request,
  });

  response.cookies.set(cookie);
  return response;
}

export default async function middleware(request: NextRequest) {
  // Ignore images in PUBLIC FOLDER
  if (
    request.nextUrl.pathname.endsWith("png") ||
    request.nextUrl.pathname.endsWith("svg")
  ) {
    return NextResponse.next();
  }

  // Ensure a session is attached to each user
  const sessionId = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  let session = sessionId ? await Session.get(sessionId) : null;
  const isBot = isbot(request.headers.get("User-Agent"));
  if (!session) {
    session = await Session.create(isBot);
    return setRequestAndResponseCookies(request, session.getCookie());
  }

  // Extends expiration time on first load and not on link navigation
  // only if the request doesn't come from a bot
  if (request.headers.get("accept")?.includes("text/html") && !isBot) {
    await session.extendValidity();
    return setRequestAndResponseCookies(request, session.getCookie());
  }

  // Pass method to headers so that it is accessible within components
  const headers = new Headers(request.headers);
  headers.set("x-method", request.method.toUpperCase());

  return NextResponse.next({
    request: {
      headers,
    },
  });
}

export const config = {
  // dont match `_next`, `api` routes or static paths
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|opengraph-image*|robots.txt|sitemap.xml).*)",
  ],
};
