import { NextResponse } from "next/server";
import { SESSION_COOKIE_KEY } from "./lib/constants";
import { Session } from "./lib/session";
import type { NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE_KEY)?.value;

  // Ensure a session is attached to each user
  if (!sessionId || (await Session.get(sessionId)) === null) {
    const session = await Session.create();

    const cookie = session.getCookie();

    // we set the cookies on request + response so that
    // it is immediatly accessible when calling `cookies()`
    // and the cookie is set for subsequent requests
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

  return NextResponse.next();
}

export const config = {
  // dont match `_next`, `api` routes or static paths
  matcher: [
    "/((?!api|_next/:path*|favicon.ico|fonts|opengraph-image*|robots.txt|sitemap.xml).*)",
  ],
};
