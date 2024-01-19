"use server";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "~/env";
import { SESSION_COOKIE_KEY, SHARED_KEY_PREFIX } from "~/lib/shared/constants";
import { Session } from "~/lib/server/session.server";
import {
  getUserById,
  getOrInsertUserFromGithubProfile,
  githubUserSchema
} from "~/models/user";
import { experimental_taintObjectReference as taintObjectReference } from "react";
import { revalidatePath } from "next/cache";
import { withAuth, type AuthState } from "./middlewares";
import { nanoid } from "nanoid";
import { kv } from "~/lib/server/kv/index.server";

export async function authenticateWithGithub(nextUrl: string | undefined) {
  const searchParams = new URLSearchParams();

  const origin = headers().get("Origin");

  if (!origin) {
    const session = await getSession();
    session.addFlash({
      message: "Please login from the proper website",
      type: "warning"
    });
    return revalidatePath("/login");
  }

  const stateParam = nanoid(24);
  const FIVE_MINUTES = 5 * 60;
  await kv.set(
    stateParam,
    {
      nextUrl,
      origin
    },
    FIVE_MINUTES,
    SHARED_KEY_PREFIX
  );

  searchParams.append("client_id", env.GITHUB_CLIENT_ID);
  searchParams.append("redirect_uri", env.GITHUB_REDIRECT_URI);
  searchParams.append("state", stateParam);

  redirect(
    `https://github.com/login/oauth/authorize?${searchParams.toString()}`
  );
}

export const logoutUser = withAuth(async function logoutUser({
  session
}: AuthState) {
  const newSession = await session.invalidate();
  await newSession.addFlash({
    type: "info",
    message: "Logged out successfully."
  });

  cookies().set(newSession.getCookie());
});

export async function loginUser(user: any) {
  const sessionResult = githubUserSchema.safeParse(user);
  if (!sessionResult.success) {
    console.error(sessionResult.error);
    const session = await getSession();

    await session.addFlash({
      type: "error",
      message: "An unexpected error happenned on authentication, please retry"
    });

    return revalidatePath(`/`);
  }

  // Set cookie to authenticate user
  // Stay connected for 2 days
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 2);

  // Find or create the corresponding user in DB
  const ghUser = sessionResult.data;

  const [dbUser] = await getOrInsertUserFromGithubProfile(ghUser);

  const session = await getSession();
  await session.generateForUser(dbUser);

  await session.addFlash({
    type: "success",
    message: "Logged in successfully."
  });
  cookies().set(session.getCookie());
}

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

export const getUserOrRedirect = cache(async function getUserOrRedirect(
  redirectToPath?: string
) {
  const user = await getAuthedUser();

  if (!user) {
    const searchParams = new URLSearchParams();
    if (redirectToPath) {
      searchParams.set("nextUrl", redirectToPath);
    }
    redirect("/login?" + searchParams.toString());
  }
  return user;
});

export const getAuthedUser = cache(async function getUser() {
  const user = await getSession().then((session) => session.user);

  if (user) {
    const dbUser = await getUserById(user.id);

    if (dbUser !== null) {
      taintObjectReference(
        "Do not pass the whole user object to the client",
        dbUser
      );
      return dbUser;
    }
  }

  return null;
});
