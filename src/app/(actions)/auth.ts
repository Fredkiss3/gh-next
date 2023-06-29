"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { env } from "~/env.mjs";
import { setFlash } from "./flash";
import { SESSION_COOKIE_KEY, SESSION_TTL } from "~/lib/constants";
import { kv } from "~/lib/kv";
import short from "short-uuid";
import { db } from "~/lib/db";
import { User, users } from "~/app/(models)/user";
import { cache } from "react";
import { isSSR } from "~/lib/server-utils";

import type { NextResponse } from "next/server";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

const ghUserSchema = z.object({
  login: z.string(),
  id: z.number(),
  avatar_url: z.string(),
});

const userTokenSchema = z.object({
  user_id: z.number(),
});

export async function authenticateWithGithub() {
  redirect(
    `https://github.com/login/oauth/authorize?client_id=${env.GITHUB_CLIENT_ID}&redirect_uri=${env.GITHUB_REDIRECT_URI}`
  );
}

export const getUser = cache(async function getUser(): Promise<User | null> {
  const oatToken = cookies().get(SESSION_COOKIE_KEY)?.value;

  if (!oatToken) {
    return null;
  }

  try {
    const tokenValue = userTokenSchema.parse(await kv.get(`token:${oatToken}`));
    return (
      (await db.query.users.findFirst({
        where: (fields, { eq }) => eq(fields.id, tokenValue.user_id),
      })) ?? null
    );
  } catch (error) {
    console.error(
      "There was an error decoding the session Token :",
      (error as Error).message
    );
    return null;
  }
});

export async function destroySession() {
  const oatToken = cookies().get(SESSION_COOKIE_KEY)?.value;

  if (oatToken) {
    // delete the token from our KV store
    await kv.delete(`token:${oatToken}`);
    cookies().delete(SESSION_COOKIE_KEY);
  }

  // FIXME: this condition is a workaround until this PR is merged : https://github.com/vercel/next.js/pull/49439
  if (isSSR()) {
    redirect("/");
  }
}

export async function createSession(user: any, response?: NextResponse) {
  const sessionResult = ghUserSchema.safeParse(user);
  if (!sessionResult.success) {
    console.error(sessionResult.error);
    setFlash({
      type: "error",
      message: "An unexpected error happenned on authentication, please retry",
    });
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

  const token = short.generate();

  // store the token our KV store
  await kv.set(`token:${token}`, { user_id: userFromDB.id }, SESSION_TTL);

  const options: ResponseCookie = {
    name: SESSION_COOKIE_KEY,
    value: token,
    httpOnly: true,
    expires: expirationDate,
    secure: process.env.NODE_ENV === "production" ? true : undefined,
  };

  if (response) {
    response.cookies.set(options);
  } else {
    cookies().set(options);
  }
}
