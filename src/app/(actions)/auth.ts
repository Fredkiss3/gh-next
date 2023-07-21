"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "~/env.mjs";
import { SESSION_COOKIE_KEY } from "~/lib/constants";
import { forceRevalidate, ssrRedirect, withAuth } from "~/lib/server-utils";
import { Session } from "~/lib/session";
import {
  getUserFromGithubProfile,
  githubUserSchema,
} from "~/app/(models)/user";

import type { Route } from "next";

export async function authenticateWithGithub(formData: FormData) {
  const searchParams = new URLSearchParams();

  searchParams.append("client_id", env.GITHUB_CLIENT_ID);
  searchParams.append("redirect_uri", env.GITHUB_REDIRECT_URI);

  // save the url to redirect after login in session
  const nextUrl = formData.get("_nextUrl")?.toString();
  if (nextUrl) {
    const session = await getSession();
    await session.addData({
      nextUrl,
    });
  }

  redirect(
    `https://github.com/login/oauth/authorize?${searchParams.toString()}`
  );
}

export const logoutUser = withAuth(async function logoutUser() {
  const session = await getSession();

  const newSession = await session.invalidate();
  await newSession.addFlash({
    type: "info",
    message: "Logged out successfully.",
  });

  cookies().set(newSession.getCookie());

  ssrRedirect("/");
});

export async function loginUser(user: any) {
  const sessionResult = githubUserSchema.safeParse(user);
  if (!sessionResult.success) {
    console.error(sessionResult.error);
    const session = await getSession();

    await session.addFlash({
      type: "error",
      message: "An unexpected error happenned on authentication, please retry",
    });

    return await forceRevalidate();
  }

  // Set cookie to authenticate user
  // Stay connected for 2 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 2);

  // Find or create the corresponding user in DB
  const ghUser = sessionResult.data;
  const userFromDB = await getUserFromGithubProfile(ghUser);

  const session = await getSession();
  await session.regenerateForUser(userFromDB);

  await session.addFlash({
    type: "success",
    message: "Logged in successfully.",
  });
  cookies().set(session.getCookie());

  const data = (await session.popData()) as { nextUrl?: string } | undefined;
  return data?.nextUrl;
}

export const getSession = cache(async function getSession(): Promise<Session> {
  const sessionId = cookies().get(SESSION_COOKIE_KEY)?.value;

  if (!sessionId) throw new Error("Session ID must be set in middleware");

  const session = await Session.get(sessionId);

  if (!session) {
    throw new Error(
      "Session must have been created in middleware to be accessed"
    );
  }

  return session;
});

export async function getUserOrRedirect(redirectToPath?: Route) {
  const session = await getSession();

  if (!session.user) {
    const searchParams = new URLSearchParams();
    if (redirectToPath) {
      searchParams.set("nextUrl", redirectToPath);
    }
    redirect("/login?" + searchParams.toString());
  }

  return session.user;
}
