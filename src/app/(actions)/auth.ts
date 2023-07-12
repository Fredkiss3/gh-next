"use server";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "~/env.mjs";
import { SESSION_COOKIE_KEY } from "~/lib/constants";
import { db } from "~/lib/db";
import { users } from "~/lib/db/schema/user";
import { isSSR } from "~/lib/server-utils";
import { Session } from "~/lib/session";
import { revalidatePath } from "next/cache";

const ghUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string().nullish(),
});

export async function authenticateWithGithub() {
  redirect(
    `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${env.GITHUB_REDIRECT_URI}`
  );
}

export async function getAuthenticatedUser() {
  const session = await getSession();

  if (!session.user) {
    await session.addFlash({
      type: "error",
      message: "You must be authenticated to do this action.",
    });
    revalidatePath("/");

    redirect("/login");
  }

  return session.user;
}

export async function logoutUser() {
  const session = await getSession();

  const newSession = await session.invalidate();
  cookies().set(newSession.getCookie());

  await session.addFlash({
    type: "info",
    message: "Logged out successfully.",
  });

  // FIXME: this condition is a workaround until this PR is merged : https://github.com/vercel/next.js/pull/49439
  if (isSSR()) {
    redirect("/login");
  }
}

export async function loginUser(user: any) {
  const sessionResult = ghUserSchema.safeParse(user);
  if (!sessionResult.success) {
    console.error(sessionResult.error);
    const session = await getSession();

    await session.addFlash({
      type: "error",
      message: "An unexpected error happenned on authentication, please retry",
    });

    revalidatePath("/");
    return;
  }

  // Set cookie to authenticate user
  // Stay connected for 2 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 2);

  // Find or create the corresponding user in DB
  const ghUser = sessionResult.data;
  const userFromDB = await db
    .insert(users)
    .values({
      id: ghUser.id,
      github_id: ghUser.id.toString(),
      username: ghUser.login,
      avatar_url: ghUser.avatar_url,
    })
    .onConflictDoUpdate({
      target: users.github_id,
      set: {
        github_id: ghUser.id.toString(),
        username: ghUser.login,
        avatar_url: ghUser.avatar_url,
      },
    })
    .returning()
    .get();

  const session = await getSession();
  await session.regenerateForUser(userFromDB);

  await session.addFlash({
    type: "success",
    message: "Logged in successfully.",
  });
  cookies().set(session.getCookie());
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
