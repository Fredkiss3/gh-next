import { redirect } from "next/navigation";
import { loginUser } from "~/actions/auth.action";
import { env } from "~/env";
import { kv } from "~/lib/server/kv/index.server";
import type { NextRequest } from "next/server";

export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");

  if (!state || !code) {
    redirect("/");
  }

  const stateData = await kv.get<{
    nextUrl: string | undefined;
    origin: string;
  }>(state);

  // refuse auth request, it didn't originate from our server
  if (!stateData) {
    redirect("/");
  }
  // delete state data to prevent this state from being reused again
  await kv.delete(state);

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
