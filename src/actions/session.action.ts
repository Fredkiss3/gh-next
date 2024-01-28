"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  cache,
  experimental_taintObjectReference as taintObjectReference
} from "react";
import { withAuth, type AuthState } from "~/actions/middlewares";
import { nextCache } from "~/lib/server/rsc-utils.server";
import { Session } from "~/lib/server/session.server";
import { CacheKeys } from "~/lib/shared/cache-keys.shared";
import { SESSION_COOKIE_KEY } from "~/lib/shared/constants";
import { jsonFetch } from "~/lib/shared/utils.shared";

export type SuccessfulLocationData = {
  status: "success";
  country: string;
  countryCode: string;
  region: string;
  regionName: string;
  city: string;
  zip: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  query: string;
};
export type FailedLocationData = {
  status: "fail";
  message: string;
  query: string;
};
export type LocationData = SuccessfulLocationData | FailedLocationData;

export async function getLocationData(session: Session) {
  const fn = nextCache(
    (ip: string) =>
      jsonFetch<LocationData>(`http://ip-api.com/json/${ip}`, {
        cache: "force-cache"
      }),
    {
      tags: CacheKeys.geo(session.ip)
    }
  );

  return await fn(session.ip);
}

export const revokeSession = withAuth(async function revokeSession(
  sessionId: string,
  _: FormData,
  { session: currentSession, currentUser }: AuthState
) {
  const foundSesssion = await Session.getUserSession(currentUser.id, sessionId);

  if (!foundSesssion) {
    await currentSession.addFlash({
      type: "error",
      message: "The session you are trying to revoke is no longer accessible."
    });
  } else if (foundSesssion.id === currentSession.id) {
    await currentSession.addFlash({
      type: "warning",
      message: "You cannot revoke the current active session."
    });
  } else {
    await Session.endUserSession(currentUser.id, sessionId);
    await currentSession.addFlash({
      type: "success",
      message: "Session succesfully revoked."
    });
  }

  revalidatePath("/");
  redirect("/settings/sessions");
});

export const getSession = cache(async function getSession(): Promise<Session> {
  const sessionId = cookies().get(SESSION_COOKIE_KEY)?.value;

  if (!sessionId) {
    // Normally this code is never reached
    throw new Error("Session ID must be set in middleware");
  }

  const session = await Session.get(sessionId);

  if (!session) {
    // Neither this
    throw new Error(
      "Session must have been created in middleware to be accessed."
    );
  }

  taintObjectReference("Do not pass the session object to the client", session);
  return session;
});
