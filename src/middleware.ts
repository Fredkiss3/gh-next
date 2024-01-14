import { NextRequest, NextResponse, userAgent } from "next/server";
import {
  GITHUB_AUTHOR_USERNAME,
  GITHUB_REPOSITORY_NAME,
  SESSION_COOKIE_KEY
} from "./lib/shared/constants";
import { Session, type SerializedSession } from "./lib/server/session.server";

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
    value: cookie.value
  });

  const response = NextResponse.next({
    request
  });

  response.cookies.set(cookie);
  return response;
}

function isPrivateOrLocalIP(ip: string): boolean {
  const privateIPv4Regex =
    /^(10\.\d{1,3}\.\d{1,3}\.\d{1,3})|(172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})|(192\.168\.\d{1,3}\.\d{1,3})|(127\.\d{1,3}\.\d{1,3}\.\d{1,3})$/;
  const privateIPv6Regex = /^(fc00::\/7|fd[0-9a-f]{2})/;
  const localIPv6Regex = /^::1$/;

  return (
    privateIPv4Regex.test(ip) ||
    privateIPv6Regex.test(ip) ||
    localIPv6Regex.test(ip)
  );
}

async function getPublicIP(request: NextRequest) {
  let publicIP = request.headers.get("X-Forwarded-For")!;

  if (isPrivateOrLocalIP(publicIP)) {
    publicIP = await fetch("https://ipinfo.io/ip", {
      cache: "force-cache"
    }).then((r) => r.text());
  }
  return publicIP;
}

export default async function middleware(request: NextRequest) {
  // Ignore images in PUBLIC FOLDER
  if (
    request.nextUrl.pathname.endsWith("png") ||
    request.nextUrl.pathname.endsWith("svg")
  ) {
    return NextResponse.next();
  }

  // TODO : to remove
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

  // Ensure a session is attached to each user
  const sessionId = request.cookies.get(SESSION_COOKIE_KEY)?.value;
  let session = sessionId ? await Session.get(sessionId) : null;
  const { isBot, device } = userAgent(request);
  let userDevice = device.type as SerializedSession["device"] | undefined;
  if (!userDevice) {
    const uaString = (
      request.headers.get("user-agent") ?? "unknown"
    ).toLowerCase();

    if (
      uaString.includes("mozilla") ||
      uaString.includes("chrome") ||
      uaString.includes("safari")
    ) {
      userDevice = "desktop";
    } else {
      userDevice = "unknown";
    }
  }

  if (!session) {
    session = await Session.create({
      isBot,
      userAgent: request.headers.get("user-agent") ?? "unknown",
      device: userDevice,
      ip: await getPublicIP(request),
      lastAccess: new Date()
    });
    return setRequestAndResponseCookies(request, session.getCookie());
  }

  // Extends expiration time on first load and not on link navigation
  // only if the request doesn't come from a bot
  if (request.headers.get("accept")?.includes("text/html") && !isBot) {
    try {
      await session.extendValidity({
        newIp: await getPublicIP(request)
      });
    } catch (error) {
      session = await Session.create({
        userAgent: request.headers.get("user-agent") ?? "unknown",
        device: userDevice,
        ip: await getPublicIP(request),
        lastAccess: new Date()
      });
    } finally {
      return setRequestAndResponseCookies(request, session.getCookie());
    }
  }

  // Pass method to headers so that it is accessible within components
  const headers = new Headers(request.headers);
  headers.set("x-method", request.method.toUpperCase());

  return NextResponse.next({
    request: {
      headers
    }
  });
}

export const config = {
  // dont match `_next`, `api` routes or static paths
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|fonts|opengraph-image*|robots.txt|sitemap.xml).*)"
  ]
};
