"use server";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { env } from "~/env";
import { SHARED_KEY_PREFIX } from "~/lib/shared/constants";
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
import { getSession } from "./session.action";

export async function authenticateWithGithub(nextUrl: string | undefined) {
  const searchParams = new URLSearchParams();

  const origin = headers().get("Origin");

  console.log({
    origin,
    host: headers().get("Host")
  });

  if (!origin) {
    const session = await getSession();
    session.addFlash({
      message: "Please login from the proper website",
      type: "warning"
    });
    return redirect("/");
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
