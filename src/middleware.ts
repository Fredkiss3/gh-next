// import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE_KEY } from "./lib/constants";
import { Session } from "./lib/session";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE_KEY)?.value;

  if (!sessionId || (await Session.get(sessionId)) === null) {
    const session = await Session.create();

    const cookie = session.getCookie();

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
}

// See "Matching Paths" below to learn more
export const config = {
  // Matcher ignoring `/_next/`, `/api/` and `/fonts/`
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|fonts|opengraph-image.*|robots.txt|sitemap.xml).*)",
  ],
};
