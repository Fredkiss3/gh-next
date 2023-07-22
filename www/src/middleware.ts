import { NextResponse } from "next/server";
import { SESSION_COOKIE_KEY } from "./lib/constants";
import { Session } from "./lib/session";

import type { NextRequest } from "next/server";
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
  const response = NextResponse.rewrite(request.nextUrl, {
    request,
  });

  response.cookies.set(cookie);
  return response;
}

export default async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  let session = sessionId ? await Session.get(sessionId) : null;

  // Ensure a session is attached to each user
  if (!session) {
    session = await Session.create();
    return setRequestAndResponseCookies(request, session.getCookie());
  }

  // Extends expiration time on first load and not on link navigation
  if (request.headers.get("accept")?.includes("text/html")) {
    await session.extendValidity();
    return setRequestAndResponseCookies(request, session.getCookie());
  }

  return NextResponse.next();
}

export const config = {
  // dont match `_next`, `api` routes or static paths
  matcher: [
    "/((?!api|_next/:path*|favicon.ico|fonts|opengraph-image*|robots.txt|sitemap.xml).*)",
  ],
};