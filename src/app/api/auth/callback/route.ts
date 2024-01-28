import { redirect } from "next/navigation";
import { loginUser } from "~/actions/auth.action";
import { env } from "~/env";
import { kv } from "~/lib/server/kv/index.server";
import type { NextRequest } from "next/server";
import { SHARED_KEY_PREFIX } from "~/lib/shared/constants";

export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  if (!state || !code) {
    redirect("/");
  }

  const stateData = await kv.get<{
    nextUrl: string | undefined;
    origin: string;
  }>(state, SHARED_KEY_PREFIX);

  // refuse auth request, it didn't originate from our server
  if (!stateData) {
    redirect("/");
  }

  let theirOriginURL: URL | null = null;
  try {
    theirOriginURL = new URL(stateData.origin);
  } catch (error) {
    console.error(error);
    // we failed to validate that the `origin` of the request is a valid URL
    // so we refuse this auth request
    await kv.delete(state, SHARED_KEY_PREFIX);
    redirect("/");
  }

  // In the case were the request doesn't originate from the same host as this one (ex: from preview environments)
  const ourOriginHost = request.headers.get("Host");
  console.log({
    ourOriginHost,
    theirOriginHost: theirOriginURL.host
  });
  if (ourOriginHost !== theirOriginURL.host) {
    let redirectUrl: URL | null = null;
    try {
      redirectUrl = new URL("/api/auth/callback", theirOriginURL);

      if (
        process.env.NODE_ENV === "production" &&
        !redirectUrl.hostname.endsWith("gh.fredkiss.dev")
      ) {
        throw new Error("Invalid Hostname provided");
      }

      redirectUrl.searchParams.set("code", code);
      redirectUrl.searchParams.set("state", state);
    } catch (error) {
      console.error(error);
      // delete state data to prevent this state from being reused again
      await kv.delete(state, SHARED_KEY_PREFIX);
    }

    if (!redirectUrl) {
      // we failed to validate that the `origin` of the request is a valid URL
      // so we refuse this auth request
      redirect("/");
    }

    return redirect(redirectUrl.toString());
  }

  // delete state data to prevent this state from being reused again
  await kv.delete(state, SHARED_KEY_PREFIX);

  const response: any = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_SECRET,
        redirect_uri: env.GITHUB_REDIRECT_URI,
        code
      })
    }
  ).then((r) => r.json());

  if (response.error || !response.access_token) {
    console.error({
      error: response.error
    });
    return redirect("/");
  }

  const githubUser = await fetch("https://api.github.com/user", {
    headers: {
      "User-Agent": `Github-OAuth-${env.GITHUB_CLIENT_ID}`,
      Authorization: `token ${response.access_token}`,
      Accept: "application/json"
    }
  }).then((r) => r.json());

  await loginUser(githubUser);

  let url;
  try {
    url = new URL(stateData.nextUrl ?? "/", stateData.origin);
  } catch (error) {
    // pass
  }

  if (url) {
    return redirect(url.toString());
  }

  return redirect("/");
}
