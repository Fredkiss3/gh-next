import { redirect } from "next/navigation";
import { loginUser } from "~/actions/auth.action";
import { env } from "~/env";
import { isValidURLPathname } from "~/lib/shared/utils.shared";
import { NextResponse, type NextRequest } from "next/server";

export const fetchCache = "force-no-store";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    redirect("/");
  }

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
    return NextResponse.redirect(new URL("/", req.url));
  }

  const githubUser = await fetch("https://api.github.com/user", {
    headers: {
      "User-Agent": `Github-OAuth-${env.GITHUB_CLIENT_ID}`,
      Authorization: `token ${response.access_token}`,
      Accept: "application/json"
    }
  }).then((r) => r.json());

  const nextURL = await loginUser(githubUser);

  if (isValidURLPathname(nextURL)) {
    return NextResponse.redirect(new URL(nextURL, req.url));
  }

  return NextResponse.redirect(new URL("/", req.url));
}
