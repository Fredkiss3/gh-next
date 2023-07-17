import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "~/app/(actions)/auth";
import { env } from "~/env.mjs";
import { AUTHOR_USERNAME } from "./constants";

export function isSSR() {
  return headers().get("accept")?.includes("text/html");
}

export function ssrRedirect(path: string) {
  // FIXME: this condition is a workaround until this PR is merged : https://github.com/vercel/next.js/issues/49424
  if (isSSR()) {
    return redirect(path);
  }
}

export function withAuth<T extends (...args: any[]) => Promise<any>>(
  action: T
): T {
  return (async (...args: Parameters<T>) => {
    const session = await getSession();

    if (!session.user) {
      await session.addFlash({
        type: "warning",
        message: "You must be authenticated to do this action.",
      });

      await forceRevalidate();
      return;
    }
    return action(...args);
  }) as T;
}

/**
 * Force revalidate, we use this instead of `revalidatePath`
 * because it does not work within cloudfare workers
 */
export async function forceRevalidate() {
  "use server";
  cookies().delete("dummy");
}

const githubGraphQLAPIResponseSchema = z.union([
  z.object({
    message: z.string(),
    documentation_url: z.string().url(),
  }),
  z.object({
    message: z.undefined(),
    data: z.any(),
  }),
]);

/**
 * @param graphqlQuery
 * @param variables
 *
 * To explore and see the available graphQL queries, see : https://docs.github.com/fr/graphql/overview/explorer
 * @returns
 */
export async function fetchFromGithubAPI<T extends unknown>(
  graphqlQuery: string,
  variables: Record<string, any> = {}
) {
  return fetch(`https://api.github.com/graphql`, {
    method: "POST",
    body: JSON.stringify({
      query: graphqlQuery,
      variables,
    }),
    headers: {
      Authorization: `Bearer ${env.GITHUB_PERSONAL_ACCESS_TOKEN}`,
      // this header is required per the documentation : https://docs.github.com/en/rest/overview/resources-in-the-rest-api?apiVersion=2022-11-28#user-agent-required
      "User-Agent": AUTHOR_USERNAME,
    },
  })
    .then(async (r) => r.json())
    .then((json) => {
      const parsed = githubGraphQLAPIResponseSchema.parse(json);
      if (parsed.message !== undefined) {
        if (parsed.message.toLowerCase() === "bad credentials") {
          throw new Error(
            "Invalid credentials, please update the credentials in the app settings"
          );
        } else {
          throw new Error(`Unknown error ${parsed.message}`);
        }
      } else {
        return parsed.data as T;
      }
    });
}
